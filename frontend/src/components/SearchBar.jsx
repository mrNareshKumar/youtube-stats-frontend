import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { fetchChannelInfo } from '../utils/youtube';
import { Loader2, X, Clock, Star, StarOff } from 'lucide-react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const API_KEY = import.meta.env.VITE_YT_API_KEY;
const getUserDocRef = () => doc(getFirestore(getApp()), 'users', 'defaultUser');

export function SearchBar({ onAddChannel }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showRecent, setShowRecent] = useState(false);

  const inputRef = useRef();
  const debounceRef = useRef(null);
  const containerRef = useRef();
  const isFetchingRef = useRef(false);
  const fetchControllerRef = useRef(null);

  const pinned = recent.filter(r => r.pinned);
  const others = recent.filter(r => !r.pinned);

  // Load recent from Firestore or localStorage
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const docSnap = await getDoc(getUserDocRef());
        if (docSnap.exists()) {
          setRecent(docSnap.data().recentChannels || []);
        } else {
          const localData = JSON.parse(localStorage.getItem('recentChannels')) || [];
          setRecent(localData);
        }
      } catch (err) {
        console.error("Failed to load recent from Firestore:", err);
        const localData = JSON.parse(localStorage.getItem('recentChannels')) || [];
        setRecent(localData);
      }
    };
    loadRecent();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowRecent(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce + abort support
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (fetchControllerRef.current) fetchControllerRef.current.abort();

    const controller = new AbortController();
    fetchControllerRef.current = controller;

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(input.trim(), controller.signal);
    }, 300);

    return () => {
      clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [input]);

  const saveRecentToLocal = async (list) => {
    localStorage.setItem('recentChannels', JSON.stringify(list));
    setRecent(list);
    try {
      await setDoc(getUserDocRef(), { recentChannels: list }, { merge: true });
    } catch (err) {
      console.error("Failed to save recent to Firestore:", err);
    }
  };

  const updateRecent = (channel) => {
    const entry = {
      id: channel.channelId || channel.id,
      title: channel.title || 'Unknown',
      thumbnail: channel.thumbnail || '',
      pinned: recent.find(c => c.id === (channel.channelId || channel.id))?.pinned || false,
    };
    const updated = [entry, ...recent.filter(c => c.id !== entry.id)];
    saveRecentToLocal(updated.slice(0, 10));
  };

  const handleSearch = async () => {
    if (!input.trim() || isFetchingRef.current) return;
    setLoading(true);
    setError('');
    isFetchingRef.current = true;
    try {
      const channel = await fetchChannelInfo(input.trim());
      if (channel) {
        onAddChannel(channel);
        updateRecent(channel);
        setInput('');
        setSuggestions([]);
        setShowRecent(true);
      } else {
        setError('Channel not found');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching channel');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const fetchSuggestions = async (query, signal) => {
    try {
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=10&q=${encodeURIComponent(query)}&key=${API_KEY}`,
        { signal }
      );
      const searchData = await searchRes.json();
      if (!searchData.items) return;

      const ids = searchData.items.map(item => item.snippet.channelId).join(',');
      const detailsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${ids}&key=${API_KEY}`,
        { signal }
      );
      const detailsData = await detailsRes.json();

      const sorted = detailsData.items
        .map(item => ({
          id: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.default.url,
          subs: parseInt(item.statistics.subscriberCount || 0),
        }))
        .sort((a, b) => b.subs - a.subs)
        .slice(0, 5);

      setSuggestions(sorted);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Suggestion error:", err);
      }
    }
  };

  const handleChannelSelect = async (id) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const channel = await fetchChannelInfo(id);
      if (channel) {
        onAddChannel(channel);
        updateRecent(channel);
        setInput('');
        setSuggestions([]);
        setShowRecent(true);
      } else {
        setError('Channel not found');
      }
    } catch (err) {
      setError('Error fetching channel');
    } finally {
      isFetchingRef.current = false;
    }
  };

  const togglePin = (id) => {
    const updated = recent.map(item =>
      item.id === id ? { ...item, pinned: !item.pinned } : item
    );
    saveRecentToLocal(updated);
  };

  const deleteItem = (id) => {
    const updated = recent.filter(item => item.id !== id);
    saveRecentToLocal(updated);
  };

  const clearAll = () => saveRecentToLocal([]);

  return (
    <div ref={containerRef} className="relative w-full flex flex-col gap-2 z-20">
      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={input}
          onFocus={() => {
            if (!input.trim()) setShowRecent(true);
          }}
          onChange={(e) => {
            setInput(e.target.value);
            if (!e.target.value.trim()) setShowRecent(true);
            else setShowRecent(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
            else if (e.key === 'Escape') {
              setSuggestions([]);
              setShowRecent(false);
            }
          }}
          placeholder="Enter Channel Name, URL, or ID"
          aria-label="Search YouTube Channel"
          className="flex-1 px-1 py-2 rounded border dark:bg-zinc-800"
        />
        {input && !loading && (
          <button onClick={() => setInput('')}>
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
        <button
          onClick={handleSearch}
          disabled={loading}
          aria-label="Search"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <FontAwesomeIcon icon={faSearch} />}
        </button>
      </div>

      {/* Suggestions */}
      <div className="relative">
        {(suggestions.length > 0 || (input && !loading)) && (
          <div className="absolute z-50 mt-1 w-full border rounded bg-white dark:bg-zinc-800 shadow max-h-72 overflow-y-auto">
            {suggestions.length > 0 ? (
              suggestions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-blue-100 dark:hover:bg-zinc-700 cursor-pointer"
                  onMouseDown={() => handleChannelSelect(item.id)}
                >
                  <div className="flex items-center gap-2">
                    <img src={item.thumbnail} alt={item.title} className="w-6 h-6 rounded-full" />
                    <span>{item.title}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No matching channels found.</div>
            )}
          </div>
        )}

        {/* Recent */}
        {showRecent && (pinned.length > 0 || others.length > 0) && (
          <div className="absolute z-40 mt-1 w-full border rounded bg-white dark:bg-zinc-800 shadow max-h-72 overflow-y-auto">
            {pinned.length > 0 && (
              <>
                <div className="px-3 py-1 text-xs text-gray-500 flex justify-between items-center">
                  <span>⭐ Starred</span>
                </div>
                {pinned.map((item) => (
                  <RecentItem
                    key={item.id}
                    item={item}
                    onDelete={() => deleteItem(item.id)}
                    onPin={() => togglePin(item.id)}
                    onSelect={() => handleChannelSelect(item.id)}
                  />
                ))}
              </>
            )}
            {others.length > 0 && (
              <>
                <div className="px-3 py-1 text-xs text-gray-500 flex justify-between items-center">
                  <span><Clock className="w-3 h-3 inline mr-1" /> Recent</span>
                  <button onClick={clearAll} className="text-blue-500 text-xs hover:underline">
                    Clear
                  </button>
                </div>
                {others.map((item) => (
                  <RecentItem
                    key={item.id}
                    item={item}
                    onDelete={() => deleteItem(item.id)}
                    onPin={() => togglePin(item.id)}
                    onSelect={() => handleChannelSelect(item.id)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

function RecentItem({ item, onSelect, onDelete, onPin }) {
  return (
    <div className="group flex items-center justify-between px-3 py-2 hover:bg-blue-50 dark:hover:bg-zinc-700 cursor-pointer">
      <div className="flex items-center gap-2 flex-1" onMouseDown={onSelect}>
        <img src={item.thumbnail} alt={item.title} className="w-6 h-6 rounded-full" />
        <span className="truncate">{item.title}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
            onPin();
          }}
          className="text-gray-400 hover:text-yellow-500 hidden group-hover:block"
        >
          {item.pinned ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
        </button>
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-500 hidden group-hover:block"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
