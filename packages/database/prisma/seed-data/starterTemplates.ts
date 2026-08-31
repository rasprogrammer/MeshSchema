/** Seed data for `StarterTemplateSchema` — the starter templates users can pick from when creating a new project. */
export interface StarterTemplateSeed {
  name: string;
  description: string;
  image?: string;
  dbml: string;
}

export const starterTemplates: StarterTemplateSeed[] = [
  {
    name: "E-Commerce",
    description: "Products, categories, customers, orders and payments for an online store.",
    dbml: `
Table categories {
  id integer [primary key]
  name varchar [not null]
  slug varchar [unique, not null]
  created_at timestamp [default: \`now()\`]
}

Table products {
  id integer [primary key]
  category_id integer [not null]
  name varchar [not null]
  description text
  price decimal [not null]
  stock integer [default: 0]
  created_at timestamp [default: \`now()\`]
}

Table customers {
  id integer [primary key]
  name varchar [not null]
  email varchar [unique, not null]
  created_at timestamp [default: \`now()\`]
}

Table orders {
  id integer [primary key]
  customer_id integer [not null]
  status varchar [default: 'pending']
  total decimal [not null]
  created_at timestamp [default: \`now()\`]
}

Table order_items {
  id integer [primary key]
  order_id integer [not null]
  product_id integer [not null]
  quantity integer [not null]
  unit_price decimal [not null]
}

Table payments {
  id integer [primary key]
  order_id integer [unique, not null]
  method varchar [not null]
  amount decimal [not null]
  paid_at timestamp
}

Ref: products.category_id > categories.id
Ref: orders.customer_id > customers.id
Ref: order_items.order_id > orders.id
Ref: order_items.product_id > products.id
Ref: payments.order_id > orders.id
`.trim(),
  },
  {
    name: "SaaS Multi-Tenant",
    description: "Organizations, members and subscriptions for a multi-tenant SaaS product.",
    dbml: `
Table organizations {
  id integer [primary key]
  name varchar [not null]
  slug varchar [unique, not null]
  created_at timestamp [default: \`now()\`]
}

Table users {
  id integer [primary key]
  name varchar [not null]
  email varchar [unique, not null]
  created_at timestamp [default: \`now()\`]
}

Table memberships {
  id integer [primary key]
  organization_id integer [not null]
  user_id integer [not null]
  role varchar [default: 'member']
  joined_at timestamp [default: \`now()\`]
}

Table plans {
  id integer [primary key]
  name varchar [not null]
  price decimal [not null]
  billing_interval varchar [default: 'monthly']
}

Table subscriptions {
  id integer [primary key]
  organization_id integer [unique, not null]
  plan_id integer [not null]
  status varchar [default: 'active']
  current_period_end timestamp
}

Table invoices {
  id integer [primary key]
  subscription_id integer [not null]
  amount decimal [not null]
  status varchar [default: 'open']
  issued_at timestamp [default: \`now()\`]
}

Ref: memberships.organization_id > organizations.id
Ref: memberships.user_id > users.id
Ref: subscriptions.organization_id > organizations.id
Ref: subscriptions.plan_id > plans.id
Ref: invoices.subscription_id > subscriptions.id
`.trim(),
  },
  {
    name: "Blog / CMS",
    description: "Authors, posts, tags and comments for a simple blogging platform.",
    dbml: `
Table authors {
  id integer [primary key]
  name varchar [not null]
  email varchar [unique, not null]
}

Table posts {
  id integer [primary key]
  author_id integer [not null]
  title varchar [not null]
  slug varchar [unique, not null]
  body text
  published_at timestamp
  created_at timestamp [default: \`now()\`]
}

Table tags {
  id integer [primary key]
  name varchar [unique, not null]
}

Table post_tags {
  post_id integer [not null]
  tag_id integer [not null]

  indexes {
    (post_id, tag_id) [pk]
  }
}

Table comments {
  id integer [primary key]
  post_id integer [not null]
  author_name varchar [not null]
  body text [not null]
  created_at timestamp [default: \`now()\`]
}

Ref: posts.author_id > authors.id
Ref: post_tags.post_id > posts.id
Ref: post_tags.tag_id > tags.id
Ref: comments.post_id > posts.id
`.trim(),
  },
  {
    name: "Task Manager",
    description: "Projects, boards, tasks and assignees for a lightweight project tracker.",
    dbml: `
Table workspaces {
  id integer [primary key]
  name varchar [not null]
}

Table members {
  id integer [primary key]
  workspace_id integer [not null]
  name varchar [not null]
  email varchar [unique, not null]
}

Table boards {
  id integer [primary key]
  workspace_id integer [not null]
  name varchar [not null]
}

Table tasks {
  id integer [primary key]
  board_id integer [not null]
  assignee_id integer
  title varchar [not null]
  status varchar [default: 'todo']
  due_date date
  created_at timestamp [default: \`now()\`]
}

Ref: members.workspace_id > workspaces.id
Ref: boards.workspace_id > workspaces.id
Ref: tasks.board_id > boards.id
Ref: tasks.assignee_id > members.id
`.trim(),
  },
];
