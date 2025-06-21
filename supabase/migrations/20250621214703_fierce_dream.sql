/*
  # Fix get_dashboard_summary function

  1. Database Functions
    - Fix ambiguous column reference in get_dashboard_summary function
    - Qualify total_outstanding_dues column with proper table alias

  2. Changes
    - Update the get_dashboard_summary function to resolve column ambiguity
    - Ensure all column references are properly qualified with table names/aliases
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_dashboard_summary();

-- Recreate the function with proper column qualification
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS TABLE (
  total_sales numeric,
  total_transactions bigint,
  total_customers bigint,
  total_products bigint,
  low_stock_products bigint,
  pending_orders bigint,
  total_outstanding_dues numeric,
  recent_sales_count bigint
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total sales for today
    COALESCE(SUM(s.total_amount), 0) as total_sales,
    -- Total transactions for today
    COUNT(s.id) as total_transactions,
    -- Total customers
    (SELECT COUNT(*) FROM customers WHERE is_active = true) as total_customers,
    -- Total active products
    (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
    -- Low stock products
    (SELECT COUNT(*) FROM products WHERE stock_quantity <= min_stock_level AND is_active = true) as low_stock_products,
    -- Pending purchase orders
    (SELECT COUNT(*) FROM purchase_orders WHERE status = 'pending') as pending_orders,
    -- Total outstanding dues (qualified with customers table)
    (SELECT COALESCE(SUM(c.total_outstanding_dues), 0) FROM customers c WHERE c.is_active = true) as total_outstanding_dues,
    -- Recent sales count (last 24 hours)
    (SELECT COUNT(*) FROM sales WHERE sale_date >= NOW() - INTERVAL '24 hours') as recent_sales_count
  FROM sales s
  WHERE DATE(s.sale_date) = CURRENT_DATE
    AND s.payment_status = 'paid';
END;
$$;