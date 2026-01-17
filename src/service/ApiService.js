class ApiService {
    constructor(protocol = "http", host= "localhost", port = 3000, basePath="api", version = 'v1') {
        this.protocol = protocol
        this.host = host
        this.port = port
        this.basePath = basePath
        this.version = version
    }

    buildUrl(resource, id = null)  {
        let url = `${this.protocol}://${this.host}:${this.port}/${this.basePath}/${this.version}/${resource}`;

        if(id) {
            url += `/${id}`
        }
        return url
    }
}

const apiBuilder = new ApiService()

export default apiBuilder