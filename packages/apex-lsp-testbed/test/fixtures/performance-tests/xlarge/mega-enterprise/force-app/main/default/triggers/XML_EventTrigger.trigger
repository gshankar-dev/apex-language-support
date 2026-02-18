trigger XML_EventTrigger on Event (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    XML_BaseService_741.ServiceConfig config =
        new XML_BaseService_741.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            XML_Domain_748 domain =
                new XML_Domain_748();
            XML_Domain_748.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (XML_Domain_748.ValidationError err : validation.errors) {
                    if (err.severity == XML_Domain_748.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        XML_RecordService_743 service =
            new XML_RecordService_743();
        XML_BaseService_741.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'XML trigger error: ' + error);
            }
        }
    }
}
