-- Addition of Uniqueness Constraint to user_profiles
-- This ensures that EACH user has only ONE profile, 
-- allowing the ON CONFLICT(user_id) to function correctly 
-- during profile updates and customer management.

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
