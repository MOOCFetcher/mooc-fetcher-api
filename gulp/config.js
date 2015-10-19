module.exports = {
  lambda: {
    src: 'lambda_functions',
    dest: 'dist',
    opts: {
      region: 'us-east-1'
    },
    entries: {
      ProcessFetchRequest: {},
      UploadCourse: {},
      UpdateCourseraOnDemandCourses: {}
    }
  }
}
