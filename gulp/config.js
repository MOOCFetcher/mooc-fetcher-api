module.exports = {
  lambda: {
    src: 'lambda_functions',
    dest: 'dist',
    opts: {
      region: 'us-east-1',
      publish: true
    },
    entries: {
      ProcessFetchRequest: {},
      UploadCourse: {},
      UpdateCourseraOnDemandCourses: {}
    }
  }
}
