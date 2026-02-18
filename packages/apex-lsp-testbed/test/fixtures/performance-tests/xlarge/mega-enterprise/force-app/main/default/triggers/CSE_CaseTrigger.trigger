trigger CSE_CaseTrigger on Case (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    CSE_BaseService_41.ServiceConfig config =
        new CSE_BaseService_41.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            CSE_Domain_48 domain =
                new CSE_Domain_48();
            CSE_Domain_48.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (CSE_Domain_48.ValidationError err : validation.errors) {
                    if (err.severity == CSE_Domain_48.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        CSE_RecordService_43 service =
            new CSE_RecordService_43();
        CSE_BaseService_41.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'CSE trigger error: ' + error);
            }
        }
    }
}
