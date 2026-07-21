DELETE FROM `lessons`
WHERE `course_id`='stefan-bitcoin-genesis-next-era'
  AND lower(trim(`title`))='untitled lesson'
  AND trim(COALESCE(`content`,''))=''
  AND trim(COALESCE(`transcript`,''))=''
  AND trim(COALESCE(`video_key`,''))=''
  AND `primary_asset_id` IS NULL
  AND `intro_asset_id` IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM `quizzes` WHERE `quizzes`.`lesson_id`=`lessons`.`id`
  )
  AND NOT EXISTS (
    SELECT 1 FROM `lesson_resources` WHERE `lesson_resources`.`lesson_id`=`lessons`.`id`
  )
  AND NOT EXISTS (
    SELECT 1 FROM `lesson_progress` WHERE `lesson_progress`.`lesson_id`=`lessons`.`id`
  )
  AND NOT EXISTS (
    SELECT 1 FROM `lesson_help_requests` WHERE `lesson_help_requests`.`lesson_id`=`lessons`.`id`
  )
  AND NOT EXISTS (
    SELECT 1 FROM `media_playback_grants` WHERE `media_playback_grants`.`lesson_id`=`lessons`.`id`
  )
  AND NOT EXISTS (
    SELECT 1 FROM `learner_concept_mastery` WHERE `learner_concept_mastery`.`lesson_id`=`lessons`.`id`
  );

UPDATE `courses`
SET `updated_at`=1784646000000
WHERE `id`='stefan-bitcoin-genesis-next-era'
  AND changes() > 0;
