class ApiResponse {
    constructor(status, message, data = null) {
      this.status = status;
      this.message = message;
      this.data = data;
    }
  
    static success(message, data = null) {
        return new ApiResponse('success',  message, data);
    }
  
    static error(message, data = null) {
      return new ApiResponse('fail', message, data);
    }
  }
  
  module.exports = ApiResponse;