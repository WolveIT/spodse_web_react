import React, { useState, useCallback, useEffect } from "react";
import Button from "../../components/Button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  CircularProgress,
  useTheme,
  Typography,
} from "@material-ui/core";
import LocationSelector from "../../components/LocationSelector";
import {
  KeyboardTimePicker,
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import PersonIcon from "@material-ui/icons/Person";
import MomentUtils from "@date-io/moment";
import { connect } from "dva";
import { fetchTransport, loadPhoneSuggestion } from "../../models/order";
import Autocomplete from "@material-ui/lab/Autocomplete";
import AlertPopup from "../../components/AlertPopup";
import Order from "../../services/order";
import { globalErrorHandler } from "../../utils/errorHandler";
import Alert from "../../components/Alert";
import { isValidPhone, isValidName } from "../../utils/validations";

let autoFilledPhone = "";
let autoFilledName = "";
export default connect(
  ({ order }) => ({
    tankersLoading: order.loading.transport,
    transport: order.transport || [],
    phoneLoading: order.loading.phoneSuggestion,
    phoneSuggestion: order.phoneSuggestion || [],
  }),
  { fetchTransport, loadPhoneSuggestion }
)(function CreateOrder(props) {
  const [open, setOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const theme = useTheme();

  const show = useCallback(() => {
    setOpen(true);
  });

  const hide = useCallback(() => {
    setOpen(false);
  });

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState();
  const [isScheduled, setIsScheduled] = useState(false);
  const [transport, setTransport] = useState();
  const [scheduledAt, setScheduledAt] = useState(new Date());
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const handleScheduledSwitch = useCallback(() => setIsScheduled(!isScheduled));
  const handleTransportChange = useCallback((e) =>
    setTransport(e.target.value)
  );
  const handleNameChange = useCallback((e) => setName(e.target.value));
  const handlePhoneChange = useCallback((e) => {
    const val = e.target.value;
    if (val.length === 11) {
      if (val !== autoFilledPhone)
        props.loadPhoneSuggestion("+92" + val.slice(1));
    }
    setPhone(val);
    if (val === autoFilledPhone) {
      setName(autoFilledName);
      setIsAutoFilled(true);
    } else setIsAutoFilled(false);
  });
  const handleDateChange = useCallback((d) => {
    setScheduledAt(d.toDate());
  });

  const clearState = useCallback(() => {
    setPhone("");
    setName("");
    setLocation(undefined);
    setIsScheduled(false);
    setTransport(undefined);
    setScheduledAt(new Date());
  });

  const onSubmit = useCallback(() => {
    setSubmitLoading(true);
    Order.create({
      dropoffLocation: location,
      waterAmount: transport.waterAmount,
      tankerType: transport.type,
      useWalletFirst: true,
      scheduledAt: isScheduled ? scheduledAt.getTime() : null,
      customerPhoneNumber: "+92" + phone.slice(1),
      customerDisplayName: name,
    })
      .then(() => {
        hide();
        clearState();
        Alert.show({ text: "Order creation successful!", type: "success" });
      })
      .catch(globalErrorHandler)
      .finally(() => setSubmitLoading(false));
  });

  const onCancel = useCallback(() => {
    clearState();
    hide();
  });

  const handleSubmit = useCallback(() => {
    AlertPopup({
      title: "Confirm Submission",
      message: "Place new order with the entered details?",
      onOk: onSubmit,
      onCancel: () => {},
    });
  });

  const handleCancel = useCallback(() => {
    AlertPopup({
      title: "Cancel Submission",
      message:
        "The details you entered will be lost. Are you sure you want to cancel?",
      onOk: onCancel,
      onCancel: () => {},
    });
  });

  const onPhoneSelect = useCallback((e, val, reason) => {
    if (reason === "select-option") {
      autoFilledPhone = phone;
      autoFilledName = val.displayName;
      setName(val.displayName);
      setIsAutoFilled(true);
    }
  });

  useEffect(() => {
    props.fetchTransport();
  }, []);

  return (
    <>
      <Button
        style={{ position: "absolute", top: "16px", right: "24px" }}
        onClick={show}
        title="Place Order"
      />
      <Dialog maxWidth="sm" fullWidth open={open} onClose={hide}>
        <DialogTitle id="form-dialog-title">Place New Order</DialogTitle>
        <DialogContent>
          <DialogContentText>Customer Details</DialogContentText>

          <Grid container>
            <Grid xs item>
              <Autocomplete
                id="customer-phone-number"
                loading={props.phoneLoading}
                options={props.phoneSuggestion}
                inputValue={phone}
                getOptionLabel={(option) => option.phoneNumber || ""}
                onChange={onPhoneSelect}
                filterOptions={(x) => x}
                renderOption={(customer) => {
                  return (
                    <Grid container alignItems="center">
                      <Grid item>
                        <PersonIcon
                          style={{
                            color: theme.palette.text.secondary,
                            marginRight: theme.spacing(2),
                          }}
                        />
                      </Grid>
                      <Grid item xs>
                        <Typography>{customer.displayName}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {customer.phoneNumber}
                        </Typography>
                      </Grid>
                    </Grid>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    required={true}
                    {...params}
                    onChange={handlePhoneChange}
                    fullWidth
                    label="Phone Number"
                  />
                )}
              />
            </Grid>
            <div style={{ width: "32px" }} />
            <Grid xs item>
              <TextField
                required={true}
                disabled={isAutoFilled}
                value={name}
                onChange={handleNameChange}
                fullWidth
                label="Full Name"
              />
            </Grid>
          </Grid>

          <DialogContentText style={{ marginTop: "40px" }}>
            Order Details
          </DialogContentText>

          <Grid style={{ margin: "16px 0" }} container>
            <LocationSelector
              required={true}
              initialLocation={location}
              onLocationChange={setLocation}
            />
          </Grid>

          <Grid style={{ margin: "16px 0" }} container>
            <Grid item xs>
              {props.tankersLoading ? (
                <CircularProgress size={28} />
              ) : (
                <FormControl style={{ width: "100%" }}>
                  <InputLabel>Select Water Tanker</InputLabel>
                  <Select
                    required={true}
                    value={transport}
                    onChange={handleTransportChange}
                  >
                    {props.transport.map((item, i) => (
                      <MenuItem key={i.toString()} value={item}>
                        <span style={{ fontWeight: "bold" }}>
                          {item.waterAmount} GAL
                        </span>
                        <span style={{ marginLeft: "8px", marginRight: "2px" }}>
                          -
                        </span>
                        <span style={{ textTransform: "capitalize" }}>
                          {item.type}
                        </span>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
            <div style={{ width: "32px" }} />
            <Grid
              style={{
                alignSelf: "flex-end",
              }}
              item
              xs
            >
              <InputLabel style={{ display: "inline-block" }}>
                Schedule Order
              </InputLabel>
              <Switch
                checked={isScheduled}
                onChange={(e, val) => handleScheduledSwitch(val)}
                color="primary"
              />
            </Grid>
          </Grid>

          {isScheduled && (
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <Grid style={{ margin: "16px 0" }} container>
                <Grid item xs>
                  <KeyboardDatePicker
                    required={true}
                    variant="inline"
                    format="Do MMM yyyy"
                    margin="normal"
                    label="Select Date"
                    value={scheduledAt}
                    onChange={handleDateChange}
                  />
                </Grid>
                <div style={{ width: "32px" }} />
                <Grid item xs>
                  <KeyboardTimePicker
                    required={true}
                    margin="normal"
                    label="Select Time"
                    value={scheduledAt}
                    onChange={handleDateChange}
                  />
                </Grid>
              </Grid>
            </MuiPickersUtilsProvider>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            title="Cancel"
            color="secondary"
            onClick={handleCancel}
            disabled={submitLoading}
          />
          <Button
            loading={submitLoading}
            disabled={
              !(
                isValidPhone(phone) &&
                isValidName(name) &&
                location &&
                transport &&
                scheduledAt
              )
            }
            onClick={handleSubmit}
            title="Submit"
            color="primary"
          />
        </DialogActions>
      </Dialog>
    </>
  );
});
