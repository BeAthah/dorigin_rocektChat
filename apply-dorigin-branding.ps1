<#
.SYNOPSIS
  Applies D-Origin branding (including login page) to a live Rocket.Chat workspace via REST API.

.EXAMPLE
  .\apply-dorigin-branding.ps1 -BaseUrl https://chat.dorigin.in -User admin -Password '***'
#>
param(
	[Parameter(Mandatory = $true)]
	[string]$BaseUrl,

	[Parameter(Mandatory = $true)]
	[string]$User,

	[Parameter(Mandatory = $true)]
	[string]$Password
)

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')

Write-Host "Logging in to $BaseUrl ..."
$login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/login" -ContentType 'application/json' -Body (@{
		user     = $User
		password = $Password
	} | ConvertTo-Json)

$authHeaders = @{
	'X-Auth-Token' = $login.data.authToken
	'X-User-Id'    = $login.data.userId
	'Content-Type' = 'application/json'
}

$sidenavLight = '<a href="/home" style="color:inherit;text-decoration:none;line-height:1.25"><div style="font-weight:600;font-size:14px">D-Origin</div><div style="font-weight:400;font-size:11px;opacity:.75">powered by beathah</div></a>'
$sidenavDark = '<a href="/home" style="color:#fff;text-decoration:none;line-height:1.25"><div style="font-weight:600;font-size:14px">D-Origin</div><div style="font-weight:400;font-size:11px;opacity:.75">powered by beathah</div></a>'

$customCss = @'
footer.rcx-sidebar-footer a[href*="rocket.chat"],
.rcx-sidebar-footer a[href*="rocket.chat"] { display: none !important; }
img[src*="/images/logo/logo"],
img[alt="Logo"][src*="logo.svg"],
a[href*="rocket.chat"] { display: none !important; }
'@

$customScriptLoggedOut = @'
(function () {
  if (window.__doriginLoginBranding) return;
  window.__doriginLoginBranding = true;
  function brandLogin() {
    try {
      document.querySelectorAll('img[src*="/images/logo/logo"], img[alt="Logo"][src*="logo"]').forEach(function (img) {
        if (img.dataset.doriginReplaced) return;
        img.dataset.doriginReplaced = "1";
        img.style.display = "none";
        var label = document.createElement("div");
        label.textContent = "D-Origin";
        label.style.cssText = "font-weight:700;font-size:22px;line-height:1.2;color:inherit";
        if (img.parentNode) img.parentNode.insertBefore(label, img);
      });
      document.querySelectorAll('a[href*="rocket.chat"]').forEach(function (a) {
        var box = a.parentElement;
        if (box && !box.dataset.doriginPowered) {
          box.dataset.doriginPowered = "1";
          box.textContent = "D-Origin powered by beathah";
        } else {
          a.style.display = "none";
        }
      });
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = walker.nextNode())) {
        var v = node.nodeValue;
        if (!v) continue;
        if (v.indexOf("Powered by") !== -1) {
          node.nodeValue = "D-Origin powered by beathah";
        }
      }
    } catch (e) {}
  }
  brandLogin();
  new MutationObserver(brandLogin).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
'@

$customScriptLoggedIn = @'
(function () {
  if (window.__doriginBrandingApplied) return;
  window.__doriginBrandingApplied = true;
  var replacements = {
    "Powered by Rocket.Chat": "D-Origin powered by beathah",
    "Take Rocket.Chat with you with mobile applications.": "Take D-Origin with you with mobile applications.",
    "Install Rocket.Chat on your preferred desktop platform.": "Install D-Origin on your preferred desktop platform.",
    "Learn how to unlock the myriad possibilities of Rocket.Chat.": "Learn how to unlock the myriad possibilities of D-Origin."
  };
  function replaceTextNodes(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      var value = node.nodeValue;
      if (!value || !value.trim()) continue;
      var next = value;
      Object.keys(replacements).forEach(function (from) {
        if (next.indexOf(from) !== -1) next = next.split(from).join(replacements[from]);
      });
      if (next !== value) node.nodeValue = next;
    }
  }
  function apply() { try { replaceTextNodes(document.body); } catch (e) {} }
  apply();
  new MutationObserver(function () { apply(); }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
'@

$settings = @(
	@{ _id = 'Site_Name'; value = 'D-Origin' }
	@{ _id = 'Organization_Name'; value = 'D-Origin' }
	@{ _id = 'Layout_Home_Title'; value = 'Home' }
	@{ _id = 'Layout_Sidenav_Footer'; value = $sidenavLight }
	@{ _id = 'Layout_Sidenav_Footer_Dark'; value = $sidenavDark }
	@{ _id = 'theme-custom-css'; value = $customCss }
	@{ _id = 'Custom_Script_Logged_Out'; value = $customScriptLoggedOut }
	@{ _id = 'Custom_Script_Logged_In'; value = $customScriptLoggedIn }
)

foreach ($setting in $settings) {
	Write-Host ("Setting {0} ..." -f $setting._id)
	$body = @{ value = $setting.value } | ConvertTo-Json -Compress
	Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/settings/$($setting._id)" -Headers $authHeaders -Body $body | Out-Null
}

Write-Host 'Done. Open https://chat.dorigin.in in a private window (or Ctrl+F5) to verify login branding.'
Write-Host 'Optional: Admin → Workspace → Settings → Assets → upload a D-Origin logo to replace the default image permanently.'
