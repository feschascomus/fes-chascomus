import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://colmbxzyeigmebxdqycq.supabase.co'
const supabaseKey = 'sb_publishable_jHR6PZQ_3ZrAYGdq0cA_Cw_sOO-mvDO'

export const supabase = createClient(supabaseUrl, supabaseKey)