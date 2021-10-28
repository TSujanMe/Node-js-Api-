
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        //    1->  filtering 
        const queryObj = { ...this.queryString }
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);


        // 2->  advanced filtering 
        let queryStr = JSON.stringify(queryObj);
        console.log(queryStr)
        queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, (match) => `$${match}`)
        this.query = this.query.find(JSON.parse(queryStr))

        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        };
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 100   //3 
        const skip = (page - 1) * limit
        // 5 )  pagination and limiting 
        this.query = this.query.skip(skip).limit(limit); // //it skips the given skkips and limit do to limiting the given data like if igive 2 then it wil returns only 2 
        return this;
    }
}


module.exports = APIFeatures;