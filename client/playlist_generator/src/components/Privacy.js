import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Privacy = () => {
  return (
    <Box
      sx={{
        padding: 4,
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'left',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Privacy Policy
      </Typography>
      <Typography variant="body2" gutterBottom>
        **Effective Date: December 30, 2024**
      </Typography>

      <Typography variant="body1" gutterBottom>
        Album Wall Generator operates the Album Wall Generator website, which provides the Service (the "Service").
      </Typography>

      <Typography variant="body1" gutterBottom>
        This page is used to inform website visitors regarding our policies with the collection, use, and disclosure of information if anyone decides to use our Service.
      </Typography>

      <Typography variant="body1" gutterBottom>
        If you choose to use our Service, then you agree to the collection and use of information in accordance with this policy. However, we want to make it clear that we do not log or collect your name, email address, or any personal identifiable information. Any data retrieved from your Spotify account is used solely to generate your album wall and is not stored on our servers.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        Information Collection and Use
      </Typography>
      <Typography variant="body1" gutterBottom>
      We collect several different types of information for various purposes to provide and improve our Service to you.
      </Typography>

      <Typography variant="h6" component="h3" gutterBottom>
        Log Data
      </Typography>
      <Typography variant="body2" gutterBottom>
        We want to inform you that whenever you use our Service, we may collect limited log data, such as browser type and version, IP address, and session activity. This data is used only for debugging and improving the Service and is not linked to any personal identifiers.
      </Typography>

      <Typography variant="h6" component="h3" gutterBottom>
        Cookies
      </Typography>
      <Typography variant="body2" gutterBottom>
        The Service uses cookies to improve your user experience. Cookies are temporary and only store session-related information. You can disable cookies in your browser settings, though some features of the Service may not function as intended.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        Service Providers
      </Typography>
      <Typography variant="body2" gutterBottom>
        We may employ third-party services to facilitate the functionality of our Service. These third parties do not have access to your personal information, as none is logged or stored by the Service.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        Security
      </Typography>
      <Typography variant="body2" gutterBottom>
        While we strive to use commercially acceptable means to protect the data used within our Service, remember that no method of transmission over the internet or electronic storage is 100% secure. However, since no personal information is logged, risks associated with personal data exposure are significantly minimized.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        Links to Other Sites
      </Typography>
      <Typography variant="body2" gutterBottom>
        Our Service may contain links to external websites (e.g., Spotify). Please note that we do not operate these external sites and are not responsible for their content or privacy practices. We encourage you to review the privacy policies of these third-party websites.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        Children's Privacy
      </Typography>
      <Typography variant="body2" gutterBottom>
        Our Service is not intended for children under 13. We do not knowingly collect personal identifiable information from children. If you believe that a child has provided us with personal information, please contact us so that we can take the necessary actions.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        Changes to This Privacy Policy
      </Typography>
      <Typography variant="body2" gutterBottom>
        We may update this Privacy Policy from time to time. Any changes will be posted on this page and take effect immediately upon posting. We encourage you to review this Privacy Policy periodically.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="body2" gutterBottom>
        If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us: <Link href="mailto:support@albumwallgenerator.com">laithsuresh2004@gmail.com</Link>
      </Typography>
      <ul>
        <li>
        
        </li>
      </ul>
    </Box>
  );
};

export default Privacy;
