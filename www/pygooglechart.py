"""Small local stand-in for the retired Google Image Charts client."""


class Axis:
    LEFT = 'left'
    BOTTOM = 'bottom'


class Chart:
    BASE_URL = '/static/images/chart-placeholder.svg'

    def __init__(self, *args, **kwargs):
        self.data = []

    def add_data(self, data):
        self.data.append(data)

    def get_url(self):
        return self.BASE_URL + '?legacy-chart=1'

    def set_axis_labels(self, *args, **kwargs):
        pass

    def set_bar_width(self, *args, **kwargs):
        pass

    def set_colours(self, *args, **kwargs):
        pass

    def set_grid(self, *args, **kwargs):
        pass

    def set_legend(self, *args, **kwargs):
        pass

    def fill_solid(self, *args, **kwargs):
        pass


class StackedHorizontalBarChart(Chart):
    pass


class StackedVerticalBarChart(Chart):
    pass


class PieChart(Chart):
    pass


class PieChart2D(PieChart):
    pass
