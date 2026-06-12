-- Ödeme oturumu: mobilde sessionStorage yerine token ile sunucudan yükleme
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS payment_page_url TEXT;
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS checkout_form_content TEXT;
