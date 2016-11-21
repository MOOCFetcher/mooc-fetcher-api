.PHONY: run dist upload lint

dist:
	rm -rf dist
	node_modules/.bin/webpack -p
	cd dist/UpdateCourseraOnDemandCourses; \
	zip ../UpdateCourseraOnDemandCourses.zip index.js

upload: dist
	aws lambda update-function-code --function-name UpdateCourseraOnDemandCourses --publish --zip-file fileb://dist/UpdateCourseraOnDemandCourses.zip

lint:
	node_modules/.bin/eslint --fix .