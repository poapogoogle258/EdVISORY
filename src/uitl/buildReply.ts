
export function buildErrorResponse(status_code: number ,error : unknown | string ) : any{
    let status_message : string;
    switch (status_code) {
        case 400 :
            status_message = "bad request"
            break;
        case 401 :
            status_message = "unauthorized"
            break;
        default:
            status_message = "unknown"
    }

    return {
        status_code : status_code,
        status_message : `${status_message} : ${error}`,
    }
}

export function buildResponse(status_code: number ,data : any ) : any{
    let status_message : string;
    switch (status_code) {
        case 200 :
            status_message = "success"
            break;
        case 201 :
            status_message = "created"
            break;
        case 400 :
            status_message = "bad request"
            break;
        case 401 :
            status_message = "unauthorized"
            break;
        default:
            status_message = "unknown"
    }

    return {
        statusCode : status_code,
        message : status_message,
        data : data
    }
}