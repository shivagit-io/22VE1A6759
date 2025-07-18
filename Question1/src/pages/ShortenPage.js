import React, { useState } from 'react';
import {
  Container, Typography, TextField, Button, Grid, Paper, Snackbar, IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import logger from '../logger';

const LOCAL_KEY = 'shortenedUrls';

const ShortenPage = () => {
  const [urls, setUrls] = useState([{ longUrl: '', validity: '', shortcode: '' }]);
  const [shortenedResults, setShortenedResults] = useState([]);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState('');

  // Helper to get all stored shortcodes
  const getAllShortcodes = () => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map(u => u.shortcode);
  };

  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const addUrlInput = () => {
    if (urls.length < 5) {
      setUrls([...urls, { longUrl: '', validity: '', shortcode: '' }]);
      logger.log('Added another URL input', { count: urls.length + 1 });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    logger.log('Form submitted', { urls });

    const allShortcodes = getAllShortcodes();
    const results = [];
    const newShortcodes = [];

    for (let i = 0; i < urls.length; i++) {
      let { longUrl, validity, shortcode } = urls[i];
      const urlPattern = /^(https?:\/\/)[\w.-]+\.[a-z]{2,}.*$/i;

      if (!urlPattern.test(longUrl)) {
        setError(`Row ${i + 1}: Please enter a valid long URL`);
        logger.error('Invalid long URL', { row: i + 1, longUrl });
        return;
      }

      if (!validity) validity = 30; // Default validity
      if (!Number.isInteger(+validity) || +validity <= 0) {
        setError(`Row ${i + 1}: Validity must be a positive integer`);
        logger.error('Invalid validity', { row: i + 1, validity });
        return;
      }

      if (shortcode) {
        if (!/^[a-zA-Z0-9_-]{3,10}$/.test(shortcode)) {
          setError(`Row ${i + 1}: Shortcode must be 3-10 characters (alphanumeric, -, _)`);
          logger.error('Invalid shortcode format', { row: i + 1, shortcode });
          return;
        }
        if (allShortcodes.includes(shortcode) || newShortcodes.includes(shortcode)) {
          setError(`Row ${i + 1}: Shortcode '${shortcode}' already exists`);
          logger.error('Shortcode collision', { row: i + 1, shortcode });
          return;
        }
      } else {
        // Generate unique shortcode
        let generated;
        do {
          generated = Math.random().toString(36).substring(2, 8);
        } while (allShortcodes.includes(generated) || newShortcodes.includes(generated));
        shortcode = generated;
      }
      newShortcodes.push(shortcode);
      const now = new Date();
      const expiry = new Date(now.getTime() + +validity * 60000);
      results.push({
        longUrl,
        validity: +validity,
        shortcode,
        shortUrl: `http://localhost:3000/${shortcode}`,
        createdAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
        clicks: [],
      });
    }

    // Save to localStorage
    const prev = localStorage.getItem(LOCAL_KEY);
    const prevArr = prev ? JSON.parse(prev) : [];
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...prevArr, ...results]));
    setShortenedResults(results);
    logger.log('Shortened URLs created', { results });
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    logger.log('Short URL copied', { url });
  };

  const handleCloseSnackbar = () => {
    setCopied(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>URL Shortener</Typography>
      {error && (
        <Paper sx={{ p: 2, mb: 2, background: '#ffeaea' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      <form onSubmit={handleSubmit}>
        {urls.map((url, index) => (
          <Paper elevation={3} sx={{ p: 2, mb: 2 }} key={index}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Original Long URL"
                  value={url.longUrl}
                  onChange={(e) => handleChange(index, 'longUrl', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Validity (mins)"
                  type="number"
                  value={url.validity}
                  onChange={(e) => handleChange(index, 'validity', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Custom Shortcode"
                  value={url.shortcode}
                  onChange={(e) => handleChange(index, 'shortcode', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}

        {urls.length < 5 && (
          <Button variant="outlined" onClick={addUrlInput} sx={{ mb: 2 }}>
            + Add Another URL
          </Button>
        )}

        <Button type="submit" variant="contained" color="primary">
          Shorten URLs
        </Button>
      </form>

      {shortenedResults.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <Typography variant="h5">Shortened URLs:</Typography>
          {shortenedResults.map((item, index) => (
            <Paper key={index} sx={{ p: 2, mt: 2 }}>
              <Typography>
                <strong>Original:</strong> {item.longUrl}
              </Typography>
              <Typography>
                <strong>Short URL:</strong>{' '}
                <a href={item.shortUrl} target="_blank" rel="noopener noreferrer">
                  {item.shortUrl}
                </a>
                <IconButton onClick={() => handleCopy(item.shortUrl)} size="small">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Typography>
              <Typography>
                <strong>Expires At:</strong> {new Date(item.expiresAt).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </div>
      )}

      <Snackbar
        open={Boolean(copied)}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={`Copied: ${copied}`}
        action={
          <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Container>
  );
};

export default ShortenPage;
