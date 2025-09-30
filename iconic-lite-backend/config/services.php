@@ .. @@
     'postmark' => [
         'token' => env('POSTMARK_TOKEN'),
     ],
 
+    'google' => [
+        'client_id' => env('GOOGLE_CLIENT_ID'),
+        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
+        'redirect' => env('GOOGLE_REDIRECT_URI'),
+    ],
+
+    'github' => [
+        'client_id' => env('GITHUB_CLIENT_ID'),
+        'client_secret' => env('GITHUB_CLIENT_SECRET'),
+        'redirect' => env('GITHUB_REDIRECT_URI'),
+    ],
+
+    'remita' => [
+        'merchant_id' => env('REMITA_MERCHANT_ID'),
+        'service_type_id' => env('REMITA_SERVICE_TYPE_ID'),
+        'api_key' => env('REMITA_API_KEY'),
+        'base_url' => env('REMITA_BASE_URL'),
+        'gateway_url' => env('REMITA_GATEWAY_URL'),
+        'webhook_hash' => env('REMITA_WEBHOOK_HASH'),
+    ],
+
     'resend' => [
         'key' => env('RESEND_KEY'),
     ],