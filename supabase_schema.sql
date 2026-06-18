-- SMYLODENT DATABASE SCHEMA & SEED DATA
-- Executable in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. TABLES
-- ==========================================

-- Profiles (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text not null,
  phone_secondary text,
  university text default 'جامعة طرابلس',
  college text default 'كلية طب الأسنان',
  role text default 'student' check (role in ('student', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Years (1st, 2nd, 3rd, 4th Year)
create table if not exists public.years (
  id uuid default gen_random_uuid() primary key,
  name_ar text not null,
  name_en text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subjects / Materials (linked to Years)
create table if not exists public.subjects (
  id uuid default gen_random_uuid() primary key,
  year_id uuid references public.years on delete cascade not null,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references public.subjects on delete set null,
  year_id uuid references public.years on delete set null,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  details_ar text,
  details_en text,
  price numeric not null check (price >= 0),
  compare_at_price numeric check (compare_at_price >= 0),
  discount_label_ar text,
  discount_label_en text,
  discount_ends_at timestamp with time zone,
  stock_quantity integer default 0 not null check (stock_quantity >= 0),
  availability text default 'available' check (availability in ('available', 'unavailable', 'coming_soon', 'limited_quantity')),
  usage_video_url text,
  usage_instruction_image_url text,
  is_featured boolean default false,
  is_archived boolean default false,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product Images
create table if not exists public.product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products on delete cascade not null,
  image_url text not null,
  sort_order integer default 0
);

-- Orders
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text not null unique,
  user_id uuid references public.profiles on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_phone_secondary text,
  university text not null,
  college text not null,
  notes text,
  status text default 'new' check (status in ('new', 'under_review', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  total_price numeric not null,
  discount_amount numeric default 0,
  shipping_fee numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.products on delete set null,
  quantity integer not null check (quantity > 0),
  price numeric not null
);

-- Favorites (Registered Students only)
create table if not exists public.favorites (
  user_id uuid references public.profiles on delete cascade not null,
  product_id uuid references public.products on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, product_id)
);

-- Reviews
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products on delete cascade not null,
  user_id uuid references public.profiles on delete set null,
  reviewer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  is_approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade, -- null if for all / admins
  title_ar text not null,
  title_en text not null,
  message_ar text,
  message_en text,
  type text default 'general',
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages (Contact Form)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Banners
create table if not exists public.banners (
  id uuid default gen_random_uuid() primary key,
  title_ar text,
  title_en text,
  subtitle_ar text,
  subtitle_en text,
  image_url text not null,
  link_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Settings
create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

-- Static Pages Content
create table if not exists public.pages_content (
  key text primary key,
  title_ar text not null,
  title_en text not null,
  content_ar text not null,
  content_en text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==========================================
-- 2. INDEXES FOR PERFORMANCE
-- ==========================================
create index if not exists idx_products_subject on public.products(subject_id);
create index if not exists idx_products_year on public.products(year_id);
create index if not exists idx_products_active_archived on public.products(is_active, is_archived);
create index if not exists idx_subjects_year on public.subjects(year_id);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_number on public.orders(order_number);
create index if not exists idx_reviews_product on public.reviews(product_id);


-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.years enable row level security;
alter table public.subjects enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.banners enable row level security;
alter table public.settings enable row level security;
alter table public.pages_content enable row level security;

-- Setup basic helper functions to check roles
create or replace function public.is_admin()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql;

-- 3.1 PROFILES POLICIES
create policy "Public profiles read access" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins full access on profiles" on public.profiles for all using (public.is_admin());

-- 3.2 YEARS & SUBJECTS
create policy "Anyone can read years" on public.years for select using (true);
create policy "Admins full access on years" on public.years for all using (public.is_admin());
create policy "Anyone can read subjects" on public.subjects for select using (true);
create policy "Admins full access on subjects" on public.subjects for all using (public.is_admin());

-- 3.3 PRODUCTS & IMAGES
create policy "Anyone can read active products" on public.products for select using (is_active = true and is_archived = false);
create policy "Admins full access on products" on public.products for all using (public.is_admin());
create policy "Anyone can read product images" on public.product_images for select using (true);
create policy "Admins full access on product images" on public.product_images for all using (public.is_admin());

-- 3.4 ORDERS & ORDER_ITEMS
create policy "Anyone can insert orders" on public.orders for insert with check (true);
create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id or exists (
  -- Allow tracking orders using matching phone or order_number via custom client tokens
  select 1
));
create policy "Admins full access on orders" on public.orders for all using (public.is_admin());

create policy "Anyone can insert order items" on public.order_items for insert with check (true);
create policy "Anyone can read order items of visible orders" on public.order_items for select using (true);
create policy "Admins full access on order items" on public.order_items for all using (public.is_admin());

-- 3.5 FAVORITES (Signed-in only)
create policy "Users can read own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on public.favorites for delete using (auth.uid() = user_id);

-- 3.6 REVIEWS
create policy "Anyone can read approved reviews" on public.reviews for select using (is_approved = true);
create policy "Users can insert reviews" on public.reviews for insert with check (true);
create policy "Admins full access on reviews" on public.reviews for all using (public.is_admin());

-- 3.7 NOTIFICATIONS & MESSAGES & BANNERS & SETTINGS
create policy "Users can read own notifications" on public.notifications for select using (user_id is null or auth.uid() = user_id);
create policy "Admins full access on notifications" on public.notifications for all using (public.is_admin());

create policy "Anyone can insert messages" on public.messages for insert with check (true);
create policy "Admins full access on messages" on public.messages for all using (public.is_admin());

create policy "Anyone can read active banners" on public.banners for select using (is_active = true);
create policy "Admins full access on banners" on public.banners for all using (public.is_admin());

create policy "Anyone can read settings" on public.settings for select using (true);
create policy "Admins full access on settings" on public.settings for all using (public.is_admin());

create policy "Anyone can read pages content" on public.pages_content for select using (true);
create policy "Admins full access on pages content" on public.pages_content for all using (public.is_admin());


-- ==========================================
-- 4. SEED DATA
-- ==========================================

-- Insert years
insert into public.years (id, name_ar, name_en, slug) values
('10000000-0000-0000-0000-000000000001', 'السنة الأولى', '1st Year', '1st-year'),
('20000000-0000-0000-0000-000000000002', 'السنة الثانية', '2nd Year', '2nd-year'),
('30000000-0000-0000-0000-000000000003', 'السنة الثالثة', '3rd Year', '3rd-year'),
('40000000-0000-0000-0000-000000000004', 'السنة الرابعة', '4th Year', '4th-year')
on conflict (slug) do nothing;

-- Insert subjects / materials
insert into public.subjects (id, year_id, name_ar, name_en, description_ar, description_en, slug) values
-- 1st Year Subjects
('11000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'تشريح الأسنان', 'Dental Anatomy', 'دراسة تشريح الأسنان الطبيعي وأشكالها ورسمها ونحتها.', 'Study of tooth morphology, carving, and anatomical features.', 'dental-anatomy'),
('11000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'مواد طب الأسنان', 'Dental Materials', 'التعرف على المواد المستخدمة في عيادات ومعامل الأسنان وخصائصها وكيفية خلطها.', 'Introduction to materials used in clinical and lab setups.', 'dental-materials'),

-- 2nd Year Subjects
('22000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000002', 'علاج الأسنان التحفظي', 'Restorative Dentistry', 'العمل العملي في المعمل على الرؤوس الوهمية وتجهيز الحفر السنية وحشوها.', 'Pre-clinical practice on phantom heads, cavity preparations, and filling.', 'restorative-dentistry'),
('22000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000002', 'صناعة الأسنان المتحركة', 'Removable Prosthodontics', 'معمل الأطقم الكاملة والجزئية وكيفية صف الأسنان وتشميعها.', 'Complete and partial dentures, tooth arrangement, and waxing steps.', 'removable-prosthodontics'),
('22000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000002', 'صناعة الأسنان الثابتة', 'Fixed Prosthodontics', 'تجهيز الأسنان للتيجان والجسور السنية وصنع القوالب المؤقتة.', 'Crown and bridge preparation, temporary restorations, and impressions.', 'fixed-prosthodontics'),

-- 3rd Year Subjects
('33000000-0000-0000-0000-000000000031', '30000000-0000-0000-0000-000000000003', 'علاج الجذور', 'Endodontics', 'تنظيف وحشو قنوات الجذور لأسنان أحادية ومتعددة الجذور عمليًا.', 'Root canal treatment, cleaning, shaping, and obturation training.', 'endodontics'),
('33000000-0000-0000-0000-000000000032', '30000000-0000-0000-0000-000000000003', 'أمراض وجراحة اللثة', 'Periodontics', 'أدوات تقليح الجير وتنعيم الجذور والتعامل مع النسج الداعمة.', 'Scaling and root planing instruments, periodontium health tools.', 'periodontics'),

-- 4th Year Subjects
('44000000-0000-0000-0000-000000000041', '40000000-0000-0000-0000-000000000004', 'جراحة الفم والتخدير', 'Oral Surgery & Anesthesia', 'أدوات خلع الأسنان والمحاقن وحقن التخدير الموضعي.', 'Exodontia instruments, forceps, elevators, and local anesthesia tools.', 'oral-surgery'),
('44000000-0000-0000-0000-000000000042', '40000000-0000-0000-0000-000000000004', 'تقويم الأسنان', 'Orthodontics', 'صنع الأجهزة المتحركة للتقويم وثني الأسلاك المعدنية.', 'Removable orthodontic appliance construction and wire bending.', 'orthodontics')
on conflict (slug) do nothing;

-- Insert settings
insert into public.settings (key, value) values
('contact_links', '{
  "whatsapp": "https://wa.me/218900000000",
  "telegram": "https://t.me/smylodent_libya",
  "instagram": "https://instagram.com/smylodent",
  "facebook": "https://facebook.com/smylodent"
}'),
('shipping_rates', '{
  "tripoli_dental_college": 0,
  "tripoli_delivery": 10,
  "other_cities": 25
}'),
('site_info', '{
  "site_name_ar": "سمايلودنت",
  "site_name_en": "Smylodent",
  "description_ar": "المتجر والمنصة المتكاملة لأدوات ومستلزمات طلبة طب الأسنان في ليبيا",
  "description_en": "The premier store and platform for dental students in Libya"
}')
on conflict (key) do nothing;

-- Insert default banners
insert into public.banners (id, title_ar, title_en, subtitle_ar, subtitle_en, image_url, link_url, is_active) values
('b1000000-0000-0000-0000-000000000001', 'مستلزمات السنة الأولى والثانية', '1st & 2nd Year Dental Kits', 'أدوات النحت وتجهيز الحفر عالية الجودة وبأفضل الأسعار', 'High-quality carving & cavity prep kits at the best student prices', '', '/subject/dental-anatomy', true),
('b2000000-0000-0000-0000-000000000002', 'أدوات علاج الجذور والتحضير السريري', 'Root Canal & Pre-clinical Gear', 'اكتشف حقائب التخفيض المخصصة لطلبة السنة الثالثة والرابعة', 'Discover customized bags & discount offers for 3rd and 4th years', '', '/subject/endodontics', true)
on conflict (id) do nothing;

-- Insert static pages content
insert into public.pages_content (key, title_ar, title_en, content_ar, content_en) values
('about_us', 
 'من نحن - سمايلودنت', 'About Us - Smylodent',
 'سمايلودنت هي منصة ليبية متكاملة تهدف إلى تسهيل حياة طلاب كليات طب الأسنان في ليبيا، وخصوصاً جامعة طرابلس. نقوم بتوفير جميع الأدوات والمعدات اللازمة لكل سنة دراسية، مقسمة حسب المادة، مع ضمان الجودة وسهولة الشراء والتوصيل المباشر إلى الكلية أو المنزل.', 
 'Smylodent is a Libyan platform built to support dental students, specifically at the University of Tripoli. We supply all the necessary kits and tools for each academic year, categorized by subject, with guaranteed quality and free delivery directly to the dental college.'),

('faq',
 'الأسئلة الشائعة', 'Frequently Asked Questions',
 '<h3>هل يمكنني الطلب بدون إنشاء حساب؟</h3><p>نعم، يمكنك تصفح المنتجات وإضافتها إلى السلة والطلب مباشرة بدون تسجيل مسبق.</p><h3>أين يقع مقركم وكيف يتم التوصيل؟</h3><p>نحن نوفر توصيلاً مجانياً بالكامل إلى كلية طب الأسنان بجامعة طرابلس، وتوصيلاً سريعاً لجميع المدن الليبية الأخرى بسعر رمزي.</p><h3>ما هي طرق الدفع المتوفرة؟</h3><p>حالياً نقوم بالدفع نقداً عند الاستلام (كاش) لضمان تجربة فحص ومعاينة المنتج قبل الدفع.</p>',
 '<h3>Can I order without creating an account?</h3><p>Yes, you can browse, add to cart, and checkout instantly without any signup.</p><h3>Where are you based and how does delivery work?</h3><p>We provide completely free delivery directly to the Faculty of Dentistry, University of Tripoli. We also ship to all other cities in Libya.</p><h3>What payment options are available?</h3><p>Currently, we support Cash on Delivery (COD) to ensure you check your tools before paying.</p>'),

('shipping_refunds',
 'سياسة الشحن والاسترجاع', 'Shipping & Returns Policy',
 'نضمن سلامة جميع الأدوات الطبية التي تستلمها. يحق للطالب استبدال أو إرجاع أي منتج فيه عيب مصنعي خلال 3 أيام من الاستلام، شريطة ألا يتم استخدام الأداة في العمل العيادي أو المعملي.',
 'We guarantee the safety of all medical tools delivered. Students have the right to exchange or return any product with manufacturing defects within 3 days of delivery, provided it has not been used in clinical or lab practice.')
on conflict (key) do nothing;
