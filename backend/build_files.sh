# build_files.sh
echo "Building project..."
cd backend
python3 manage.py collectstatic --noinput --clear

if [ "${RUN_MIGRATIONS}" = "true" ]; then
  python3 manage.py migrate --noinput
  python3 manage.py create_default_superuser
else
  echo "Skipping migrations and superuser creation (set RUN_MIGRATIONS=true to enable)."
fi

echo "Build completed!"
