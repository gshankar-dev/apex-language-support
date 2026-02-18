trigger SVC_ContactTrigger on Contact (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    SVC_BaseService_691.ServiceConfig config =
        new SVC_BaseService_691.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            SVC_Domain_698 domain =
                new SVC_Domain_698();
            SVC_Domain_698.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (SVC_Domain_698.ValidationError err : validation.errors) {
                    if (err.severity == SVC_Domain_698.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        SVC_RecordService_693 service =
            new SVC_RecordService_693();
        SVC_BaseService_691.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'SVC trigger error: ' + error);
            }
        }
    }
}
