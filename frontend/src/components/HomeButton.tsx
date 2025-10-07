import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Home } from 'lucide-react';

export default function HomeButton() {
  const navigate = useNavigate();
  return (
    <div className="fixed top-4 right-4 z-50">
      <Button onClick={() => navigate('/')} variant="outline" className='bg-white/10 text-white border border-white/20 hover:bg-white/15 backdrop-blur-sm shadow-[0_6px_20px_rgba(0,0,0,0.25)]'>
        <Home className="mr-2 h-4 w-4" />
        Home
      </Button>
    </div>
  );
}


