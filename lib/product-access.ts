type EntitlementRow = {
  id: string;
  productId: string;
  userId: string;
  schoolId: string;
  includesCommunity: number;
  status: string;
  startsAt: number;
  expiresAt: number | null;
};

type ProductItemRow = {
  itemType: string;
  itemId: string;
};

export function entitlementIsActive(
  entitlement: Pick<EntitlementRow, "status" | "startsAt" | "expiresAt">,
  now = Date.now(),
) {
  return entitlement.status === "active" &&
    Number(entitlement.startsAt) <= now &&
    (!entitlement.expiresAt || Number(entitlement.expiresAt) > now);
}

async function entitlementWithProduct(db: D1Database, entitlementId: string) {
  return db.prepare(
    `SELECT pe.id,pe.product_id AS productId,pe.user_id AS userId,
      pe.status,pe.starts_at AS startsAt,pe.expires_at AS expiresAt,
      p.school_id AS schoolId,p.includes_community AS includesCommunity
     FROM product_entitlements pe
     JOIN products p ON p.id=pe.product_id
     WHERE pe.id=?`,
  ).bind(entitlementId).first<EntitlementRow>();
}

async function productItems(db: D1Database, productId: string) {
  const rows = await db.prepare(
    `SELECT item_type AS itemType,item_id AS itemId
     FROM product_items WHERE product_id=? ORDER BY position,id`,
  ).bind(productId).all<ProductItemRow>();
  return rows.results;
}

export async function activateProductAccess(
  db: D1Database,
  entitlementId: string,
  now = Date.now(),
) {
  const entitlement = await entitlementWithProduct(db, entitlementId);
  if (!entitlement || !entitlementIsActive(entitlement, now)) {
    throw new Error("An active product entitlement is required.");
  }
  const items = await productItems(db, entitlement.productId);
  const courses = items.filter((item) => item.itemType === "course");

  const statements = [
    db.prepare(
      `INSERT INTO school_members (id,school_id,user_id,role,status,joined_at)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(school_id,user_id) DO UPDATE SET
         status='active',
         role=CASE
           WHEN school_members.role IN ('owner','admin','instructor')
             THEN school_members.role
           ELSE 'learner'
         END`,
    ).bind(
      crypto.randomUUID(),
      entitlement.schoolId,
      entitlement.userId,
      "learner",
      "active",
      now,
    ),
    ...courses.map((item) =>
      db.prepare(
        `INSERT INTO enrollments
          (id,user_id,course_id,progress,status,support_note,last_activity_at,
           access_source,access_source_id,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(user_id,course_id) DO UPDATE SET
           status='active',
           last_activity_at=excluded.last_activity_at,
           access_source=CASE
             WHEN enrollments.access_source='direct' AND enrollments.status='active'
               THEN enrollments.access_source
             ELSE excluded.access_source
           END,
           access_source_id=CASE
             WHEN enrollments.access_source='direct' AND enrollments.status='active'
               THEN enrollments.access_source_id
             ELSE excluded.access_source_id
           END`,
      ).bind(
        crypto.randomUUID(),
        entitlement.userId,
        item.itemId,
        0,
        "active",
        "",
        now,
        "product",
        entitlement.id,
        now,
      )
    ),
  ];

  if (entitlement.includesCommunity) {
    const community = await db.prepare(
      "SELECT id FROM communities WHERE school_id=?",
    ).bind(entitlement.schoolId).first<{ id: string }>();
    if (community) {
      statements.push(
        db.prepare(
          `INSERT INTO community_members
            (id,community_id,user_id,role,status,joined_at,access_source,access_source_id)
           VALUES (?,?,?,?,?,?,?,?)
           ON CONFLICT(community_id,user_id) DO UPDATE SET
             status='active',
             access_source=CASE
               WHEN community_members.access_source='direct'
                 AND community_members.status='active'
                 THEN community_members.access_source
               ELSE excluded.access_source
             END,
             access_source_id=CASE
               WHEN community_members.access_source='direct'
                 AND community_members.status='active'
                 THEN community_members.access_source_id
               ELSE excluded.access_source_id
             END`,
        ).bind(
          crypto.randomUUID(),
          community.id,
          entitlement.userId,
          "member",
          "active",
          now,
          "product",
          entitlement.id,
        ),
      );
    }
  }

  const sessions = await db.prepare(
    `SELECT ls.id FROM live_sessions ls
     WHERE ls.product_id=? AND ls.status='scheduled' AND ls.ends_at>?
       AND (
         ls.capacity=0 OR (
           SELECT COUNT(*) FROM live_attendance la
           WHERE la.session_id=ls.id AND la.status IN ('registered','attended')
         ) < ls.capacity
       )
     ORDER BY ls.starts_at LIMIT 75`,
  ).bind(entitlement.productId, now).all<{ id: string }>();
  for (const session of sessions.results) {
    statements.push(
      db.prepare(
        `INSERT INTO live_attendance
          (id,session_id,user_id,status,registered_at,attendance_minutes)
         VALUES (?,?,?,?,?,0)
         ON CONFLICT(session_id,user_id) DO UPDATE SET status='registered'`,
      ).bind(
        crypto.randomUUID(),
        session.id,
        entitlement.userId,
        "registered",
        now,
      ),
    );
  }

  for (let offset = 0; offset < statements.length; offset += 75) {
    await db.batch(statements.slice(offset, offset + 75));
  }
  return {
    entitlement,
    courseIds: courses.map((item) => item.itemId),
    registeredSessionIds: sessions.results.map((session) => session.id),
  };
}

async function replacementEntitlement(
  db: D1Database,
  userId: string,
  courseId: string,
  excludedEntitlementId: string,
  now: number,
) {
  return db.prepare(
    `SELECT pe.id
     FROM product_entitlements pe
     JOIN product_items pi
       ON pi.product_id=pe.product_id
      AND pi.item_type='course' AND pi.item_id=?
     WHERE pe.user_id=? AND pe.id<>? AND pe.status='active'
       AND pe.starts_at<=? AND (pe.expires_at IS NULL OR pe.expires_at>?)
     LIMIT 1`,
  ).bind(courseId, userId, excludedEntitlementId, now, now)
    .first<{ id: string }>();
}

async function replacementCommunityEntitlement(
  db: D1Database,
  entitlement: EntitlementRow,
  now: number,
) {
  return db.prepare(
    `SELECT pe.id FROM product_entitlements pe
     JOIN products p ON p.id=pe.product_id
     WHERE pe.user_id=? AND pe.id<>? AND p.school_id=?
       AND p.includes_community=1 AND pe.status='active'
       AND pe.starts_at<=? AND (pe.expires_at IS NULL OR pe.expires_at>?)
     LIMIT 1`,
  ).bind(
    entitlement.userId,
    entitlement.id,
    entitlement.schoolId,
    now,
    now,
  ).first<{ id: string }>();
}

export async function resyncProductAccess(
  db: D1Database,
  entitlementId: string,
  now = Date.now(),
) {
  const entitlement = await entitlementWithProduct(db, entitlementId);
  if (!entitlement || !entitlementIsActive(entitlement, now)) return null;
  const currentItems = await productItems(db, entitlement.productId);
  const currentCourseIds = new Set(
    currentItems.filter((item) => item.itemType === "course").map((item) => item.itemId),
  );
  const sourcedEnrollments = await db.prepare(
    `SELECT course_id AS courseId FROM enrollments
     WHERE user_id=? AND access_source='product' AND access_source_id=?`,
  ).bind(entitlement.userId, entitlement.id).all<{ courseId: string }>();
  for (const enrollment of sourcedEnrollments.results) {
    if (currentCourseIds.has(enrollment.courseId)) continue;
    const replacement = await replacementEntitlement(
      db,
      entitlement.userId,
      enrollment.courseId,
      entitlement.id,
      now,
    );
    if (replacement) {
      await db.prepare(
        `UPDATE enrollments SET access_source_id=?
         WHERE user_id=? AND course_id=? AND access_source_id=?`,
      ).bind(
        replacement.id,
        entitlement.userId,
        enrollment.courseId,
        entitlement.id,
      ).run();
    } else {
      await db.prepare(
        `UPDATE enrollments SET status='paused',last_activity_at=?
         WHERE user_id=? AND course_id=? AND access_source_id=?`,
      ).bind(
        now,
        entitlement.userId,
        enrollment.courseId,
        entitlement.id,
      ).run();
    }
  }
  if (!entitlement.includesCommunity) {
    const replacement = await replacementCommunityEntitlement(db, entitlement, now);
    if (replacement) {
      await db.prepare(
        `UPDATE community_members SET access_source_id=?
         WHERE user_id=? AND access_source='product' AND access_source_id=?`,
      ).bind(replacement.id, entitlement.userId, entitlement.id).run();
    } else {
      await db.prepare(
        `UPDATE community_members SET status='paused'
         WHERE user_id=? AND access_source='product' AND access_source_id=?`,
      ).bind(entitlement.userId, entitlement.id).run();
    }
  }
  return activateProductAccess(db, entitlement.id, now);
}

export async function revokeProductAccess(
  db: D1Database,
  entitlementId: string,
  now = Date.now(),
) {
  const entitlement = await entitlementWithProduct(db, entitlementId);
  if (!entitlement) return null;
  const items = await productItems(db, entitlement.productId);
  await db.prepare(
    `UPDATE product_entitlements
     SET status='revoked',updated_at=? WHERE id=?`,
  ).bind(now, entitlement.id).run();

  for (const item of items.filter((entry) => entry.itemType === "course")) {
    const replacement = await replacementEntitlement(
      db,
      entitlement.userId,
      item.itemId,
      entitlement.id,
      now,
    );
    if (replacement) {
      await db.prepare(
        `UPDATE enrollments SET access_source_id=?
         WHERE user_id=? AND course_id=? AND access_source='product'
           AND access_source_id=?`,
      ).bind(
        replacement.id,
        entitlement.userId,
        item.itemId,
        entitlement.id,
      ).run();
    } else {
      await db.prepare(
        `UPDATE enrollments SET status='paused',last_activity_at=?
         WHERE user_id=? AND course_id=? AND access_source='product'
           AND access_source_id=?`,
      ).bind(
        now,
        entitlement.userId,
        item.itemId,
        entitlement.id,
      ).run();
    }
  }

  await db.prepare(
    `UPDATE live_attendance SET status='cancelled'
     WHERE user_id=? AND session_id IN (
       SELECT id FROM live_sessions
       WHERE product_id=? AND status='scheduled' AND starts_at>?
     )`,
  ).bind(entitlement.userId, entitlement.productId, now).run();

  if (entitlement.includesCommunity) {
    const replacement = await replacementCommunityEntitlement(db, entitlement, now);
    if (replacement) {
      await db.prepare(
        `UPDATE community_members SET access_source_id=?
         WHERE user_id=? AND access_source='product' AND access_source_id=?`,
      ).bind(replacement.id, entitlement.userId, entitlement.id).run();
    } else {
      await db.prepare(
        `UPDATE community_members SET status='paused'
         WHERE user_id=? AND access_source='product' AND access_source_id=?`,
      ).bind(entitlement.userId, entitlement.id).run();
    }
  }
  return entitlement;
}
