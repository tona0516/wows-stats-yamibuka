start "" chrome --new-window --app=http://localhost:8080
set NODE_CAPTURE=true
set NODE_ENV=production
%~d0
cd "%~p0"
node index.js %~n1
