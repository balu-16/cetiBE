import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://ekrrfkgrycqfqokrxjxe.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcnJma2dyeWNxZnFva3J4anhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjQzNzgsImV4cCI6MjA2ODAwMDM3OH0.S52dbzM-zSvs5gLZYEveluYpmMnCHgJ1y3q957ge00I';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;