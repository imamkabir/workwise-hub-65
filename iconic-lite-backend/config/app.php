@@ .. @@
     'timezone' => env('APP_TIMEZONE', 'UTC'),
 
     'locale' => env('APP_LOCALE', 'en'),
 
     'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),
 
     'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),
 
     'cipher' => 'AES-256-CBC',
 
     'key' => env('APP_KEY'),
 
     'previous_keys' => [
         ...array_filter(
             explode(',', env('APP_PREVIOUS_KEYS', ''))
         ),
     ],
 
+    /*
+    |--------------------------------------------------------------------------
+    | Iconic Lite Configuration
+    |--------------------------------------------------------------------------
+    */
+
+    'frontend_url' => env('FRONTEND_URL', 'http://localhost:8080'),
+    'daily_login_credits' => env('DAILY_LOGIN_CREDITS', 1),
+    'referral_bonus_credits' => env('REFERRAL_BONUS_CREDITS', 10),
+    'ad_reward_credits' => env('AD_REWARD_CREDITS', 2),
+    'credit_to_ngn_rate' => env('CREDIT_TO_NGN_RATE', 20),
+    'max_file_size' => env('MAX_FILE_SIZE', 104857600),
+    'allowed_file_types' => env('ALLOWED_FILE_TYPES', 'pdf,docx,doc,mp3,mp4,avi,mov,png,jpg,jpeg,gif'),
+
 ];