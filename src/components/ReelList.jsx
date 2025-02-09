import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ReelList = () => {
  const [reels, setReels] = useState([]);

  useEffect(() => {
    const fetchReels = async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('reels')
        .select('*')
        .eq('user_id', user.id);
      if (error) {
        alert(error.message);
      } else {
        setReels(data);
      }
    };
    fetchReels();
  }, []);

  return (
    <div className="reel-list">
      {reels.map((reel) => (
        <div key={reel.id} className="reel-card">
          <iframe
            src={`https://www.instagram.com/reel/${reel.url.split('/reel/')[1].split('/')[0]}/embed`}
            title={reel.title}
            width="100%"
            height="150"
            frameBorder="0"
            scrolling="no"
            allowTransparency="true"
          ></iframe>
          <h3>{reel.title}</h3>
          <p>Tags: {reel.tags.join(', ')}</p>
          <p>Collection: {reel.collection}</p>
        </div>
      ))}
    </div>
  );
};

export default ReelList;