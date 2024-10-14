class ApiResponse{
    constructor(statusCode,data,message = "Sucess"){
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
        this.success = statusCode < 400 
    }
}