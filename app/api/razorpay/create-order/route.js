import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Razorpay from 'razorpay'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId } = await request.json()
    // Define exact amounts in INR (paise)
    const amount = planId === 'annual' ? 900000 : 190000 // 9000 INR vs 1900 INR

    if (!process.env.RAZORPAY_KEY_ID) {
      console.warn("⚠️ RAZORPAY_KEY_ID is missing. Defaulting to mock success for MVP dev.")
      // Update plan directly for dev testing if keys not found
      const admin = createAdminClient()
      await admin.from('profiles').update({ plan: planId }).eq('id', user.id)
      return Response.json({ status: 'mock_success', message: 'Razorpay keys missing. Simulating upgrade.', url: '/dashboard' })
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: { userId: user.id, planId }
    })

    return Response.json({ order_id: order.id, amount, currency: 'INR', key: process.env.RAZORPAY_KEY_ID })

  } catch (error) {
    console.error('Razorpay Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
