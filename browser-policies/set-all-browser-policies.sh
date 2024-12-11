sudo mkdir -p /etc/firefox/policies
sudo cp policies.json /etc/firefox/policies/

sudo mkdir -p /etc/opt/chrome/policies/managed
sudo cp my-chrome-policy.json /etc/opt/chrome/policies/managed/

sudo mkdir -p /etc/chromium/policies/managed
sudo cp my-chrome-policy.json /etc/chromium/policies/managed/
