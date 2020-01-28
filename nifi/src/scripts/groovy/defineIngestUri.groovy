import java.nio.charset.StandardCharsets
import groovy.json.JsonSlurper
import org.apache.commons.io.IOUtils

FlowFile flowFile = session.get()
if (flowFile != null) {
    String uriExpression = flowFile.getAttribute('ecUriExpression')

    // If URI expression is dependent on the entity name, attempt to retrieve from the content.
    // We may need to broaden this if subsequent processors need the entityId flow file att but
    // not sure if there is an entity ID for all entities.
    if (uriExpression.indexOf("entityId") > -1) {
        // Load the contents of the flow file into a string.
        String colName = flowFile.getAttribute('ecIdColumnName')
        String text = null;
        session.read(flowFile, { inputStream ->
            text = IOUtils.toString(inputStream, StandardCharsets.UTF_8)
        } as InputStreamCallback)

        def json = new JsonSlurper().parseText(text)

        // Pass on the value that may be used as a unique ID for this entity.
        String entityId = json[colName]
        flowFile = session.putAttribute(flowFile, "entityId", entityId)
    }

    // Evaluate the expression, making at least some attributes available to the evaluator.
    PropertyValue propValue = context.newPropertyValue(uriExpression)
    String ingestUri = propValue.evaluateAttributeExpressions(flowFile).getValue()

    // Pass on the result
    flowFile = session.putAttribute(flowFile, "marklogic.uri", ingestUri)

    session.transfer(flowFile, REL_SUCCESS)
}