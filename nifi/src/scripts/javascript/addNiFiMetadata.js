var flowFile = session.get();
if (flowFile != null) {
	var StreamCallback = Java.type("org.apache.nifi.processor.io.StreamCallback"),
	    IOUtils = Java.type("org.apache.commons.io.IOUtils"),
	    StandardCharsets =  Java.type("java.nio.charset.StandardCharsets"),
	    funcCapitalizeFirstLetter = function(str) { return str.charAt(0).toUpperCase() + str.slice(1) },
	    flowFileAttMap = flowFile.getAttributes(),
	    metadata = {};

	// Capture more info about the flow file and input source in general.
	metadata.ingestSystem = 'NiFi';
	metadata.ingestEntryDate = flowFile.getEntryDate();
	metadata.ingestId = flowFile.getId();
	metadata.ingestLastQueueDate = flowFile.getLastQueueDate();
	metadata.ingestLineageStartDate = flowFile.getLineageStartDate();
	metadata.ingestLineageStartIndex = flowFile.getLineageStartIndex();
	metadata.ingestQueueDateIndex = flowFile.getQueueDateIndex();
	metadata.ingestSize = flowFile.getSize();
	metadata.ingestPenalized = flowFile.isPenalized();

	// Capture flow file atts as metadata.
	for (var key in flowFileAttMap) {
	  metadata['ingest' + funcCapitalizeFirstLetter(key)] = flowFileAttMap[key];
	}

	// Add metadata to the flow file.
	flowFile = session.write(flowFile, new StreamCallback(function(inputStream, outputStream) {
		var text = IOUtils.toString(inputStream, StandardCharsets.UTF_8),
		    updatedContent = {"incoming": {
				"raw": JSON.parse(text),
				"metadata": metadata
			}};
		outputStream.write(JSON.stringify(updatedContent, null, '\t').getBytes(StandardCharsets.UTF_8));
	}));

	session.transfer(flowFile, REL_SUCCESS)
}