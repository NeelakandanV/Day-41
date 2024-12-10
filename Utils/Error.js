const unknownEndpoint = (req,res) => {
    res.status(404).send({error : 'Unknown endpoint'})
};

export default unknownEndpoint;