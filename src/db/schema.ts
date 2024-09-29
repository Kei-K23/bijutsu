import { relations } from "drizzle-orm";
import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
  foreignKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const usersRelations = relations(users, ({ one }) => ({
  profileInfo: one(profileInfo),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

export const roleEnum = pgEnum("role", ["artist", "user", "admin"]);

export const profileInfo = pgTable("profile_info", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  displayName: text("display_name").unique(),
  image: text("image"),
  bio: text("bio"),
  role: roleEnum("role").notNull().default("artist"),
  userId: text("user_id").references(() => users.id),
  dateJoined: timestamp("date_joined").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const profileInfoRelations = relations(profileInfo, ({ one, many }) => ({
  user: one(users, { fields: [profileInfo.userId], references: [users.id] }),
  artworks: many(artworks),
  comments: many(comments),
  likes: many(likes),
  favorites: many(favorites),
  follower: many(follows),
  followings: many(follows),
}));

export const artworkTypeEnum = pgEnum("type", [
  "Digital Art",
  "Sticker",
  "Painting",
  "Handmade",
  "Photo",
  "GIFs",
  "AI Generated",
  "Illustration",
]);

export const licenseTypeEnum = pgEnum("license_type", [
  "Creative Commons",
  "Free to use",
  "Copyright",
]);

export const artworks = pgTable("artworks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  mainImage: text("main_image").notNull(),
  image1: text("image1"),
  image2: text("image2"),
  image3: text("image3"),
  type: artworkTypeEnum("type").notNull(),
  licenseType: licenseTypeEnum("license_type").notNull(),
  isPublish: boolean("is_publish").default(true),
  isDeleted: boolean("is_deleted").default(false),
  viewsCount: integer("views_count").default(0),
  likesCount: integer("likes_count").default(0),
  profileId: text("profile_id").references(() => profileInfo.id),
  categoryId: text("category_id").references(() => categories.id),
  dateUploaded: timestamp("date_uploaded").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const artworksRelations = relations(artworks, ({ one, many }) => ({
  profileInfo: one(profileInfo, {
    fields: [artworks.profileId],
    references: [profileInfo.id],
  }),
  category: one(categories, {
    fields: [artworks.categoryId],
    references: [categories.id],
  }),
  artworksToTags: many(artworksToTags),
  comments: many(comments),
  likes: many(likes),
  favorites: many(favorites),
}));

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").unique().notNull(),
  description: text("description"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  artworks: many(artworks),
}));

export const tags = pgTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").unique().notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  artworksToTags: many(artworksToTags),
}));

export const artworksToTags = pgTable("artwork_tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  artworkId: text("artwork_id")
    .notNull()
    .references(() => artworks.id),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id),
  name: text("name").unique().notNull(),
});

export const artworksToTagsRelations = relations(artworksToTags, ({ one }) => ({
  artwork: one(artworks, {
    fields: [artworksToTags.artworkId],
    references: [artworks.id],
  }),
  tag: one(tags, {
    fields: [artworksToTags.tagId],
    references: [tags.id],
  }),
}));

export const comments = pgTable(
  "comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    content: text("content").notNull(),
    dateCommented: timestamp("date_commented").defaultNow(),
    artworkId: text("artwork_id")
      .notNull()
      .references(() => artworks.id),
    profileId: text("profile_id").references(() => profileInfo.id),
    parentCommentId: text("parent_comment_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => {
    return {
      parentReference: foreignKey({
        columns: [table.parentCommentId],
        foreignColumns: [table.id],
        name: "contracts_parent_comment_id_fkey",
      }),
    };
  }
);

export const commentsRelations = relations(comments, ({ one }) => ({
  artwork: one(artworks, {
    fields: [comments.artworkId],
    references: [artworks.id],
  }),
  profile: one(profileInfo, {
    fields: [comments.profileId],
    references: [profileInfo.id],
  }),
}));

export const likes = pgTable("likes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  artworkId: text("artwork_id")
    .notNull()
    .references(() => artworks.id),
  profileId: text("profile_id").references(() => profileInfo.id),
  dateLiked: timestamp("date_liked").defaultNow(),
});

export const likesRelations = relations(likes, ({ one }) => ({
  artwork: one(artworks, {
    fields: [likes.artworkId],
    references: [artworks.id],
  }),
  profile: one(profileInfo, {
    fields: [likes.profileId],
    references: [profileInfo.id],
  }),
}));

export const favorites = pgTable("favorites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  artworkId: text("artwork_id")
    .notNull()
    .references(() => artworks.id),
  profileId: text("profile_id").references(() => profileInfo.id),
  dateFavorited: timestamp("date_favorited").defaultNow(),
});

export const favoritesRelations = relations(favorites, ({ one }) => ({
  artwork: one(artworks, {
    fields: [favorites.artworkId],
    references: [artworks.id],
  }),
  profile: one(profileInfo, {
    fields: [favorites.profileId],
    references: [profileInfo.id],
  }),
}));

export const follows = pgTable("follows", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  followerId: text("follower_id").references(() => profileInfo.id),
  followingId: text("following_id").references(() => profileInfo.id),
  dateFollowed: timestamp("date_followed").defaultNow(),
});

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(profileInfo, {
    fields: [follows.followerId],
    references: [profileInfo.id],
  }),
  following: one(profileInfo, {
    fields: [follows.followingId],
    references: [profileInfo.id],
  }),
}));

export const notifications = pgTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").references(() => profileInfo.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  dateCreated: timestamp("date_created").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  profile: one(profileInfo, {
    fields: [notifications.profileId],
    references: [profileInfo.id],
  }),
}));
