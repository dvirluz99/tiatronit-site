// Legacy route /collection/[id] — the site now uses /category/[id] for
// multi-show grouping pages. Anything that lands here after the architecture
// migration is redirected. Kept around so external / indexed links keep
// working during transition.

import { redirect } from 'next/navigation';
import { getAllShows, getAllCategories } from '../../../lib/data';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Legacy collections_v2 still exists as an immutable backup of the pre-refactor
// state — read from it here only to resolve old `type: 'single'` cards back to
// their underlying show.
async function legacyLookup(id) {
  try {
    const snap = await getDocs(collection(db, 'collections_v2'));
    for (const d of snap.docs) {
      if (d.id === id) return { id: d.id, ...d.data() };
    }
  } catch {
    // ignore — may not exist or be accessible
  }
  return null;
}

export default async function CollectionRedirect({ params }) {
  const { id } = await params;

  const [categories, shows] = await Promise.all([getAllCategories(), getAllShows()]);

  if (categories[id]) redirect(`/category/${id}`);
  if (shows[id]) redirect(`/show/${id}`);

  const legacy = await legacyLookup(id);
  if (legacy) {
    if (legacy.type === 'collection') redirect(`/category/${id}`);
    if (legacy.type === 'single' && legacy.linkedShowId) {
      redirect(`/show/${legacy.linkedShowId}`);
    }
  }

  return (
    <main className="continer_main_for_home">
      <p style={{ textAlign: 'center', marginTop: '3rem' }}>הדף לא נמצא</p>
    </main>
  );
}
