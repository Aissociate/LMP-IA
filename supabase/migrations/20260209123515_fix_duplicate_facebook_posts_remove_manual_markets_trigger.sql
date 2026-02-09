/*
  # Fix duplicate Facebook/social media posts

  ## Problem
  Every new market was being posted to Facebook TWICE because:
  1. `trigger_auto_publish_manual_market` on `manual_markets` fires on INSERT -> posts to Facebook
  2. `auto_sync_manual_market_to_public` syncs the market to `public_markets`
  3. `trigger_auto_publish_public_market` on `public_markets` fires on INSERT -> posts to Facebook again

  ## Fix
  Remove the `trigger_auto_publish_manual_market` trigger from `manual_markets`.
  Posts will only be sent once, via the `public_markets` trigger after sync.

  ## Changes
  - Drop trigger `trigger_auto_publish_manual_market` from `manual_markets`
*/

DROP TRIGGER IF EXISTS trigger_auto_publish_manual_market ON manual_markets;
