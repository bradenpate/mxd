function generateSignature() {
  const name = document.getElementById('name').value;
  const title = document.getElementById('title').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;

  const signatureHTML = `
    <table style="font-family: Arial, sans-serif; color: #333; font-size: 12px; line-height: 1.1; border-spacing: 0; border-collapse: collapse; width: 100%;">
      <!-- Name -->
      <tr>
        <td style="padding: 0; font-size: 12px; font-weight: bold; line-height: 1.1;">${name}</td>
      </tr>
      <!-- Title -->
      <tr>
        <td style="padding: 0; font-size: 12px; line-height: 1.1;">${title}</td>
      </tr>
      <!-- Divider Line -->
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #146FF4;"></td>
      </tr>
      <!-- Phone -->
      <tr>
        <td style="padding: 10px 0 0 0; font-size: 10px; line-height: 1.1;">${phone}</td>
      </tr>
      <!-- Email -->
      <tr>
        <td style="padding: 2px 0 0 0; font-size: 10px; line-height: 1.1;">
          <a href="mailto:${email}" style="color: #0078d4; text-decoration: none;">${email}</a>
        </td>
      </tr>
      <!-- Website -->
      <tr>
        <td style="padding: 2px 0 0 0; font-size: 10px; line-height: 1.1;">
          <a href="https://mendix.com" style="color: #0078d4; text-decoration: none;">mendix.com</a>
        </td>
      </tr>
      <!-- Logo -->
      <tr>
        <td style="padding: 15px 0 0 0;">
          <img src="/images/mendix-logo.png" alt="Mendix Logo" width="240" style="display: block; border: 0;">
        </td>
      </tr>
    </table>
  `;

  document.getElementById('signature-preview').innerHTML = signatureHTML;
}

function copyToClipboard() {
  const preview = document.getElementById('signature-preview');
  const range = document.createRange();
  range.selectNode(preview);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  alert('Signature copied to clipboard!');
}