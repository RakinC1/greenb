'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Topbar } from '@/components/Layout/Topbar';
import { Button } from '@/components/UI/Button';
import { Input, Select, TextArea } from '@/components/UI/Input';
import { Card } from '@/components/UI/Card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/UI/Toast';
import { computeImpact, formatCO2, formatWater } from '@/lib/impact';
import { createClient } from '@/lib/supabase';
import type { FoodCategory, FoodUnit } from '@/types';

const CATEGORIES: FoodCategory[] = ['Produce', 'Bakery', 'Cooked Meals', 'Meat', 'Dairy', 'Beverages', 'Other'];
const UNITS: FoodUnit[] = ['kg', 'lbs', 'portions', 'liters', 'pieces', 'loaves'];
const DIETARY = ['Vegan', 'Vegetarian', 'Halal', 'Kosher', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'];

export default function UploadPage() {
  const router    = useRouter();
  const { profile } = useAuth();
  const { toast }   = useToast();
  const supabase    = createClient();
  const fileRef     = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name:         '',
    category:     'Produce' as FoodCategory,
    quantity:     '',
    unit:         'kg' as FoodUnit,
    dietary_tags: [] as string[],
    expires_at:   '',
    notes:        '',
  });
  const [photoFile, setPhotoFile]     = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [analyzing, setAnalyzing]     = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const impact = form.quantity
    ? computeImpact(form.category, parseFloat(form.quantity), form.unit)
    : null;

  function toggleTag(tag: string) {
    setForm(f => ({
      ...f,
      dietary_tags: f.dietary_tags.includes(tag)
        ? f.dietary_tags.filter(t => t !== tag)
        : [...f.dietary_tags, tag],
    }));
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Auto-analyze with Gemini Vision
    setAnalyzing(true);
    const base64Reader = new FileReader();
    base64Reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      try {
        const res = await fetch('/api/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, mimeType: file.type }),
        });
        if (res.ok) {
          const data = await res.json();
          setForm(f => ({
            ...f,
            name:         data.name ?? f.name,
            category:     (CATEGORIES.includes(data.category) ? data.category : f.category) as FoodCategory,
            dietary_tags: data.dietary_tags ?? f.dietary_tags,
          }));
          toast('🤖 Gemini identified your food and pre-filled the form!');
        }
      } catch { /* silently ignore vision errors */ }
      setAnalyzing(false);
    };
    base64Reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    // 1. Upload photo if present
    let photoUrl: string | null = null;
    if (photoFile) {
      const ext  = photoFile.name.split('.').pop();
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('food-photos')
        .upload(path, photoFile, { upsert: false });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('food-photos').getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }
    }

    // 2. Create listing
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        quantity:  parseFloat(form.quantity),
        photo_url: photoUrl,
        notes:     form.notes || null,
      }),
    });

    if (res.ok) {
      toast('🎉 Listing published! Nearby shelters have been notified.');
      router.push('/listings');
    } else {
      const err = await res.json();
      toast(err.error ?? 'Failed to publish listing', 'error');
    }
    setLoading(false);
  }

  return (
    <AppLayout>
      <Topbar title="Upload Surplus Food 📤" subtitle="Post surplus food and notify shelters instantly" />

      <div className="p-8">
        <div className="grid grid-cols-[1fr_340px] gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card className="p-6 space-y-5">
              <h3 className="font-fraunces text-lg font-medium text-forest">Food Details</h3>

              {/* Photo upload */}
              <div>
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider block mb-1.5">
                  Photo {analyzing && <span className="text-sage animate-pulse">🤖 Analyzing…</span>}
                </label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-sage/30 rounded-xl p-6 text-center cursor-pointer hover:border-sage hover:bg-fern/5 transition-all"
                >
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  ) : (
                    <>
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-sm text-muted">
                        <strong className="text-sage">Click to upload</strong> or drag & drop
                      </p>
                      <p className="text-xs text-muted/60 mt-1">Gemini will auto-identify the food</p>
                    </>
                  )}
                </div>
              </div>

              <Input label="Food Item Name" value={form.name} onChange={set('name')}
                placeholder="e.g. Mixed Green Salad, Sourdough Bread…" required />

              <div className="grid grid-cols-2 gap-4">
                <Select label="Category" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Quantity" type="number" min="0.1" step="0.1"
                    value={form.quantity} onChange={set('quantity')} required />
                  <Select label="Unit" value={form.unit} onChange={set('unit')}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </Select>
                </div>
              </div>

              <Input label="Pickup Deadline" type="datetime-local"
                value={form.expires_at} onChange={set('expires_at')} required />

              <div>
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider block mb-1.5">
                  Dietary Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY.map(tag => (
                    <button
                      key={tag} type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        form.dietary_tags.includes(tag)
                          ? 'bg-sage text-white border-sage'
                          : 'border-forest/12 text-muted hover:border-sage'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <TextArea label="Notes (optional)" value={form.notes}
                onChange={set('notes')}
                placeholder="Storage instructions, allergen info, portion size…" />

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading}>🚀 Publish Listing</Button>
                <Button type="button" variant="outline">Save Draft</Button>
              </div>
            </Card>
          </form>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* AI estimate */}
            <Card className="p-5">
              <h3 className="font-fraunces text-base font-medium text-forest mb-3">🤖 AI Pickup Estimate</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Based on your food type and expiry, our AI suggests notifying shelters{' '}
                <strong>3 hours before expiry</strong> for best pickup probability.
              </p>
              <div className="bg-cream rounded-xl p-3 border border-forest/7">
                <div className="text-xs text-muted mb-1">Estimated Claim Rate</div>
                <div className="h-1.5 bg-forest/8 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sage to-fern rounded-full w-[78%] transition-all" />
                </div>
                <div className="text-sm font-semibold text-sage mt-1">78% likely to be claimed</div>
              </div>
            </Card>

            {/* Impact preview */}
            {impact && (
              <div className="bg-gradient-to-br from-forest to-moss rounded-2xl p-5 text-white">
                <div className="text-[10px] text-mint uppercase tracking-widest mb-3">
                  If this listing is rescued:
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🌱', val: formatCO2(impact.co2),    label: 'CO₂ Prevented' },
                    { icon: '💧', val: formatWater(impact.water), label: 'Water Saved'    },
                    { icon: '🍽', val: `~${impact.meals}`,        label: 'Meals Provided' },
                    { icon: '♻️', val: '0 kg',                   label: 'To Landfill'    },
                  ].map(item => (
                    <div key={item.label} className="bg-white/8 rounded-xl p-3 text-center">
                      <div className="text-xl">{item.icon}</div>
                      <div className="font-fraunces text-lg font-bold text-white mt-1">{item.val}</div>
                      <div className="text-[10px] text-white/50 mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
