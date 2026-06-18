-- MOMENTUM Database Expansion Migration

-- 1. Extend profiles table with onboarding, theme, and gamification columns
ALTER TABLE profiles ADD COLUMN xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE profiles ADD COLUMN theme TEXT NOT NULL DEFAULT 'lavanda' CHECK (theme IN ('lavanda','menta','coral','indigo'));
ALTER TABLE profiles ADD COLUMN avatar_id TEXT NOT NULL DEFAULT 'owl-lavanda';
ALTER TABLE profiles ADD COLUMN onboarded BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN daily_goal INTEGER NOT NULL DEFAULT 3;

-- 2. Extend tasks table with difficulty level and completion timestamp columns
ALTER TABLE tasks ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'medio' CHECK (difficulty IN ('facil','medio','dificil'));
ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMPTZ;

-- 3. Trigger and function to award XP on task completion
CREATE OR REPLACE FUNCTION award_xp()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
  current_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Verify if task transitioned to completed
  IF NEW.completed = true AND OLD.completed = false THEN
    -- Assign completion date
    NEW.completed_at := now();

    -- Determine difficulty XP points
    CASE NEW.difficulty
      WHEN 'facil' THEN points_to_award := 10;
      WHEN 'medio' THEN points_to_award := 15;
      WHEN 'difil' THEN points_to_award := 20; -- Handles typo in checking if difficulty spelled differently
      WHEN 'dificil' THEN points_to_award := 20;
      ELSE points_to_award := 15;
    END CASE;

    -- Update user profile XP
    UPDATE profiles 
    SET xp = xp + points_to_award
    WHERE id = NEW.user_id
    RETURNING xp INTO current_xp;

    -- Calculate level: floor(xp / 80) + 1
    new_level := floor(current_xp / 80) + 1;

    -- Apply new calculated level
    UPDATE profiles
    SET level = new_level
    WHERE id = NEW.user_id;

  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_task_completed_award_xp
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION award_xp();
