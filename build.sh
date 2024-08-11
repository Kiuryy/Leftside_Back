#!/bin/bash

supported_chrome_versions=10
supported_firefox_versions=1

#
# ARGUMENTS
#
mode=""
targets=()

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --mode=*) mode="${1#*=}";;
        --target=*) IFS=',' read -r -a targets <<< "${1#*=}";;
        *) echo "Unknown parameter: $1" >&2; exit 1;;
    esac
    shift
done


#
# PREPARE
#
mkdir -p dist
rm -rf dist/*


#
# TRANSLATION
#
cp -a src/_locales dist


#
# IMAGES
#
cp -a src/img dist


#
# SCSS
#
if [ "$mode" = "release" ]; then
  sass src/scss:dist/css --style compressed
else
  sass src/scss:dist/css
fi


#
# HTML
#
if [ "$mode" = "release" ]; then
  html-minifier-terser --input-dir src/html --output-dir dist/html --collapse-whitespace --remove-comments --minify-js true
else
  cp -a src/html dist
fi


#
# JS
#
mkdir -p dist/js

if [ "$mode" = "release" ]; then

  eslint --fix "src/js/**/*.js"
  wget https://raw.githubusercontent.com/Kiuryy/jsu.js/master/src/js/jsu.js -O src/js/lib/jsu.js
  terser_options=(--compress --mangle "reserved=['jsu','chrome']")

else

  terser_background_options=(--source-map "url='background.js.map'")
  terser_extension_options=(--source-map "url='extension.js.map'")
  terser_settings_options=(--source-map "url='settings.js.map'")

fi

terser src/js/background.js "${terser_background_options[@]:-${terser_options[@]}}" --output dist/js/background.js
terser src/js/extension.js src/js/init.js "${terser_extension_options[@]:-${terser_options[@]}}" --output dist/js/extension.js
terser src/js/lib/jsu.js src/js/settings.js "${terser_settings_options[@]:-${terser_options[@]}}" --output dist/js/settings.js


#
# MANIFEST
#
for target in "${targets[@]}"; do
  manifest_json=$(cat "src/manifest.$target.json")

  extension_version=$(npm pkg get version)
  manifest_json=$(echo "$manifest_json" | jq ".version = $extension_version")

  if [ "$mode" = "release" ]; then
    manifest_json=$(echo "$manifest_json" | sed 's/icon\/dev\//icon\//g')
  fi

  if [ "$target" = "chrome" ]; then

    content=$(wget -qO- "https://versionhistory.googleapis.com/v1/chrome/platforms/win64/channels/stable/versions")
    latest_chrome_version=$(echo "$content" | jq -r '.versions[0].version' | cut -d '.' -f 1)
    min_chrome_version=$((latest_chrome_version - supported_chrome_versions))
    manifest_json=$(echo "$manifest_json" | jq ".minimum_chrome_version = \"$min_chrome_version\"")

    if [ "$mode" = "build" ]; then
      manifest_json=$(echo "$manifest_json" | jq ".version_name = \"Dev\"")
    fi

  elif [ "$target" = "firefox" ]; then

    content=$(wget -qO- "https://product-details.mozilla.org/1.0/firefox_versions.json")
    latest_firefox_version=$(echo "$content" | jq -r '.LATEST_FIREFOX_VERSION' | cut -d '.' -f 1)
    min_firefox_version=$((latest_firefox_version - supported_firefox_versions))
    manifest_json=$(echo "$manifest_json" | jq ".browser_specific_settings.gecko.strict_min_version = \"$min_firefox_version\"")

  fi

  echo "$manifest_json" > "dist/manifest.$target.json"

  if [ "$mode" = "build" ]; then
    mv "dist/manifest.$target.json" dist/manifest.json
  fi

done


#
# ZIP
#
if [ "$mode" = "release" ]; then
  rm -f ./*.zip
  cd dist || exit

  for target in "${targets[@]}"; do

    find . -mindepth 1 -maxdepth 1 -type d -print | zip -r "../extension.$target.zip" -@
    cp -a "manifest.$target.json" manifest.json
    zip -r "../extension.$target.zip" manifest.json
    rm -f manifest.json

  done

fi