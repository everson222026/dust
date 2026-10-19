type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          username: string;
          display_name: string;
          bio: string;
          photo_url: string;
          created_at: string;
        },
        {
          id: string;
          username: string;
          display_name: string;
          bio?: string;
          photo_url?: string;
          created_at?: string;
        }
      >;
      posts: Table<
        {
          id: string;
          author_id: string;
          title: string;
          description: string;
          category: string;
          image_url: string;
          why_useless: string;
          history: string;
          location: string;
          condition: string;
          created_at: string;
        },
        {
          id?: string;
          author_id: string;
          title: string;
          description: string;
          category: string;
          image_url?: string;
          why_useless?: string;
          history?: string;
          location?: string;
          condition?: string;
          created_at?: string;
        }
      >;
      follows: Table<
        {
          follower_id: string;
          following_id: string;
          created_at: string;
        },
        {
          follower_id: string;
          following_id: string;
          created_at?: string;
        }
      >;
      likes: Table<
        {
          post_id: string;
          user_id: string;
          created_at: string;
        },
        {
          post_id: string;
          user_id: string;
          created_at?: string;
        }
      >;
      saved_posts: Table<
        {
          post_id: string;
          user_id: string;
          created_at: string;
        },
        {
          post_id: string;
          user_id: string;
          created_at?: string;
        }
      >;
      comments: Table<
        {
          id: string;
          post_id: string;
          author_id: string;
          text: string;
          created_at: string;
        },
        {
          id?: string;
          post_id: string;
          author_id: string;
          text: string;
          created_at?: string;
        }
      >;
      activities: Table<
        {
          id: string;
          recipient_id: string;
          actor_id: string;
          target_user_id: string | null;
          target_post_id: string | null;
          type: 'follow' | 'like' | 'comment' | 'publication';
          message: string;
          created_at: string;
          read: boolean;
        },
        {
          id?: string;
          recipient_id: string;
          actor_id: string;
          target_user_id?: string | null;
          target_post_id?: string | null;
          type: 'follow' | 'like' | 'comment' | 'publication';
          message: string;
          created_at?: string;
          read?: boolean;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
