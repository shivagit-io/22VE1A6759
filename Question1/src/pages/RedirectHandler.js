import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Container, Typography } from '@mui/material';
import logger from '../logger';

const LOCAL_KEY = 'shortenedUrls';

const RedirectHandler = () => {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching original URL from localStorage
    const fetchRedirect = async () => {
      try {
        logger.log('Redirect attempt', { shortcode });
        const stored = localStorage.getItem(LOCAL_KEY);
        if (!stored) throw new Error('No shortened URLs found');
        const arr = JSON.parse(stored);
        const found = arr.find(u => u.shortcode === shortcode);
        if (!found) {
          logger.error('Shortcode not found', { shortcode });
          navigate('/shorten');
          return;
        }
        // Check expiry
        if (new Date(found.expiresAt) < new Date()) {
          logger.warn('Shortcode expired', { shortcode });
          navigate('/shorten');
          return;
        }
        // Log click event
        const click = {
          timestamp: new Date().toISOString(),
          source: document.referrer || 'direct',
          location: 'unknown', // Placeholder for geo
        };
        found.clicks = found.clicks || [];
        found.clicks.push(click);
        // Update storage
        const updated = arr.map(u => u.shortcode === shortcode ? found : u);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
        logger.log('Redirecting to original URL', { shortcode, longUrl: found.longUrl, click });
        setTimeout(() => {
          window.location.href = found.longUrl;
        }, 1500);
      } catch (err) {
        logger.error('Redirect error', { shortcode, error: err.message });
        navigate('/shorten'); // fallback
      }
    };

    fetchRedirect();
  }, [shortcode, navigate]);

  return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Redirecting to original URL...
      </Typography>
    </Container>
  );
};

export default RedirectHandler;
