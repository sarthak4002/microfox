#!/bin/bash

# Reset packagefox-build.json
echo '{"requests": []}' > .microfox/packagefox-build.json

# Reset pr-usage.json
echo '{}' > .microfox/pr-usage.json

echo "Successfully reset .microfox files" 