-- A script is not a playable video. Keep complete written lessons available while
-- only presenting lessons with attached assets as audio or video.
UPDATE `lessons`
SET `lesson_type`='text',`required_watch_percent`=0,`updated_at`=1784576400000
WHERE `course_id` IN (
  'northstar-ai-command-studio',
  'stefan-bitcoin-genesis-next-era',
  'stefan-web3-foundations'
)
AND `lesson_type` IN ('video','audio')
AND `primary_asset_id` IS NULL;
