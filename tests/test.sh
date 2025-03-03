echo "Cleaning outdated coverage files"
echo " > coverage"
rm -rf coverage

echo ""
echo "Checking files with ESLint"
npm run lint
if [ "$?" -ne 0 ]
then
    exit 1
fi
echo " Done!"

echo ""
echo "Running unit tests with Vitest"
npx vitest run --coverage
