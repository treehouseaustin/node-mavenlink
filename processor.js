class Processor {

  /**
   * process mavenlink resources to friendlier data structure to work with
   * @see http://developer.mavenlink.com/#response-format
   * @param {Object} data The mavenlink request response
   * @param {String} entityName the entity name extracted from the specific mavenlink request, check the mavenlink response format
   * @return {Object} contains an array for the data returned and a meta object containing info about total items & pages for the resource
   */
  processResult(data, entityName) {
    let result = data.results.map(result => {
      return data[entityName][result.id];
    });
    let totalPages = Math.ceil(data.count / data.results.length) || 0;
    return {
      data: result,
      meta: {
        totalItems: data.count,
        totalPages
      }
    };
  }

  /**
   * process mavenlink resources that includes a relation with another object
   * @see http://developer.mavenlink.com/#includes
   * @param {Object} data The mavenlink request response
   * @param {String} entityName the entity name extracted from the specific mavenlink request, check the mavenlink response format
   * @param {relatedFieldOptions} relatedFieldOptions related field options used to determine how to get the values for the related field
   * @param {String} relatedFieldOptions.relatedField the property name in the data array its value is either an id or array of ids and refers to the related object
   * @param {String} relatedFieldOptions.relatedObject the related object property name
   * @param {String} [relatedFieldOptions.renameTo] if present will remove relatedField key and add a new key to the result
   * @return {Object} contains an array for the data returned and a meta object containing info about total items & pages for the resource
   */
  processResultWithRelation(data, entityName, relatedFieldOptions) {
    let { relatedField, relatedObject, renameTo } = relatedFieldOptions;
    let result = this.processResult(data, entityName);
    result.data.forEach(item => {
      let relatedFieldVal = item[relatedField],
          relatedFieldResult;
      if (!relatedFieldVal) return;
      if (relatedFieldVal instanceof Array) {
        relatedFieldResult = relatedFieldVal.map(item => {
          return data[relatedObject][item];
        });
      } else {
        relatedFieldResult = data[relatedObject][relatedField];
      }
      if (renameTo) {
        delete item[relatedField];
        item[renameTo] = relatedFieldResult;
      } else {
        item[relatedField] = relatedFieldResult;
      }
    });
    return result;
  }

}

module.exports = Processor;
