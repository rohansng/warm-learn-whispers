
-- Create chat rooms table for one-on-one conversations
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(participant_1, participant_2),
  CHECK (participant_1 != participant_2)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'voice', 'note_share')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false
);

-- Create chat requests table for managing friend requests
CREATE TABLE public.chat_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Create user settings table for privacy preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  allow_chat_requests BOOLEAN DEFAULT true,
  show_typing_indicator BOOLEAN DEFAULT true,
  show_read_receipts BOOLEAN DEFAULT true,
  show_last_seen BOOLEAN DEFAULT true,
  push_notifications_chat BOOLEAN DEFAULT true,
  push_notifications_notes BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view their own chat rooms" 
  ON public.chat_rooms 
  FOR SELECT 
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create chat rooms" 
  ON public.chat_rooms 
  FOR INSERT 
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their chat rooms" 
  ON public.messages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = chat_room_id 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  ));

CREATE POLICY "Users can send messages in their chat rooms" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = chat_room_id 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  ));

CREATE POLICY "Users can update their own messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = sender_id);

-- RLS Policies for chat_requests
CREATE POLICY "Users can view chat requests sent to or from them" 
  ON public.chat_requests 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create chat requests" 
  ON public.chat_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update chat requests sent to them" 
  ON public.chat_requests 
  FOR UPDATE 
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_chat_rooms_participants ON public.chat_rooms(participant_1, participant_2);
CREATE INDEX idx_messages_chat_room ON public.messages(chat_room_id, created_at);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_chat_requests_receiver ON public.chat_requests(receiver_id, status);

-- Enable realtime for chat functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;

-- Function to ensure chat room ordering (participant_1 < participant_2)
CREATE OR REPLACE FUNCTION public.ensure_chat_room_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.participant_1 > NEW.participant_2 THEN
    -- Swap participants to maintain consistent ordering
    NEW.participant_1 := OLD.participant_2;
    NEW.participant_2 := OLD.participant_1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain chat room participant ordering
CREATE TRIGGER ensure_chat_room_order_trigger
  BEFORE INSERT OR UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_chat_room_order();
