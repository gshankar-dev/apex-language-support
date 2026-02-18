trigger JNL_ContactTrigger on Contact (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    JNL_BaseService_861.ServiceConfig config =
        new JNL_BaseService_861.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            JNL_Domain_868 domain =
                new JNL_Domain_868();
            JNL_Domain_868.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (JNL_Domain_868.ValidationError err : validation.errors) {
                    if (err.severity == JNL_Domain_868.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        JNL_RecordService_863 service =
            new JNL_RecordService_863();
        JNL_BaseService_861.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'JNL trigger error: ' + error);
            }
        }
    }
}
