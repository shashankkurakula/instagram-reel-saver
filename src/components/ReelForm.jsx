import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ReelForm = ({ setReels }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [collection, setCollection] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: user } = await supabase.auth.getUser();
    const newReel = { url, title, tags: tags.split(','), collection, user_id: user.id };
    const { data, error } = await supabase.from('reels').insert([newReel]);
    if (error) {
      alert(error.message);
    } else {
      setReels((prev) => [...prev, data[0]]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Instagram Reel URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <input
        type="text"
        placeholder="Collection"
        value={collection}
        onChange={(e) => setCollection(e.target.value)}
      />
      <button type="submit">Save Reel</button>
    </form>
  );
};

export default ReelForm;