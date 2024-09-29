import { relations } from "drizzle-orm";
import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
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
  role: roleEnum("role").notNull(),
  userId: text("user_id").references(() => users.id),
  dateJoined: timestamp("date_joined").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const profileInfoRelations = relations(profileInfo, ({ one, many }) => ({
  user: one(users, { fields: [profileInfo.userId], references: [users.id] }),
  artworks: many(artworks),
}));

export const artworkTypeEnum = pgEnum("type", [
  "Digital Art",
  "Sticker",
  "Painting",
  "Handmade",
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

export const artworksRelations = relations(artworks, ({ one }) => ({
  profileInfo: one(profileInfo, {
    fields: [artworks.profileId],
    references: [profileInfo.id],
  }),
  category: one(categories, {
    fields: [artworks.categoryId],
    references: [categories.id],
  }),
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

export const tag = pgTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").unique().notNull(),
});

// export const artworkTags = pgTable("artwork_tags", {
//   id: text("id")
//     .primaryKey()
//     .$defaultFn(() => crypto.randomUUID()),
//   name: text("name").unique().notNull(),
//   name: text("name").unique().notNull(),
// });
