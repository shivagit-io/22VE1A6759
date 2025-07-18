import React from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import logger from '../logger';

const LOCAL_KEY = 'shortenedUrls';

const StatsPage = () => {
  let stats = [];
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    stats = stored ? JSON.parse(stored) : [];
    logger.log('Stats page viewed', { count: stats.length });
  } catch (err) {
    logger.error('Stats page error', { error: err.message });
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        URL Click Statistics
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Shortcode</TableCell>
              <TableCell>Short URL</TableCell>
              <TableCell>Original URL</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Click Count</TableCell>
              <TableCell>Click Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.shortcode}</TableCell>
                <TableCell>
                  <a href={row.shortUrl} target="_blank" rel="noopener noreferrer">
                    {row.shortUrl}
                  </a>
                </TableCell>
                <TableCell>
                  <a href={row.longUrl} target="_blank" rel="noopener noreferrer">
                    {row.longUrl}
                  </a>
                </TableCell>
                <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                <TableCell>{new Date(row.expiresAt).toLocaleString()}</TableCell>
                <TableCell>{row.clicks ? row.clicks.length : 0}</TableCell>
                <TableCell>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>View Clicks</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {row.clicks && row.clicks.length > 0 ? (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Timestamp</TableCell>
                              <TableCell>Source</TableCell>
                              <TableCell>Location</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {row.clicks.map((click, i) => (
                              <TableRow key={i}>
                                <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                                <TableCell>{click.source}</TableCell>
                                <TableCell>{click.location}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Typography>No clicks yet.</Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default StatsPage;
