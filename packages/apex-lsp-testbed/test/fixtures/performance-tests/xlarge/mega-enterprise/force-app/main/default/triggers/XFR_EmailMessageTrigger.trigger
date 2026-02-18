trigger XFR_EmailMessageTrigger on EmailMessage (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    XFR_BaseService_481.ServiceConfig config =
        new XFR_BaseService_481.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            XFR_Domain_488 domain =
                new XFR_Domain_488();
            XFR_Domain_488.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (XFR_Domain_488.ValidationError err : validation.errors) {
                    if (err.severity == XFR_Domain_488.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        XFR_RecordService_483 service =
            new XFR_RecordService_483();
        XFR_BaseService_481.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'XFR trigger error: ' + error);
            }
        }
    }
}
